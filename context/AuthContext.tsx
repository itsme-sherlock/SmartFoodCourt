"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabase, hasSupabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface User {
	id: string;
	name: string;
	role: 'employee' | 'vendor' | 'admin';
	email: string;
	stall?: string;
	[key: string]: any;
}

export interface Order {
	orderId: string;
	userId: string;
	userName: string;
	items: any[];
	subtotal: number;
	tax: number;
	total: number;
	paymentMethod: string;
	orderType: 'now' | 'slot';
	selectedSlot?: string;
	reservationType?: 'late-meal' | 'pre-order';
	reservationDate?: string;
	reservationTime?: string;
	status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
	timestamp: number;
	date: string;
}

interface AuthContextType {
	user: User | null;
	role: 'employee' | 'vendor' | 'admin' | null;
	cart: any[];
	orders: Order[];
	login: (user: User) => void;
	logout: () => void;
	setRole: (role: 'employee' | 'vendor' | 'admin') => void;
	addToCart: (item: any) => void;
	removeFromCart: (itemId: string) => void;
	clearCart: () => void;
	addOrder: (order: Order) => Promise<void>;
	getOrderHistory: () => Order[];
	repeatOrder: (orderId: string) => void;
	updateOrderStatus: (orderId: string, status: string) => Promise<void>;
	markOrderReady: (orderId: string) => Promise<void>;
	loadVendorOrders: () => Promise<void>;
	refreshOrders: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [role, setRole] = useState<'employee' | 'vendor' | 'admin' | null>(null);
	const [cart, setCart] = useState<any[]>([]);
	const [orders, setOrders] = useState<Order[]>([]);

	// Load orders from localStorage and Supabase on mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const storedOrders = localStorage.getItem('orderHistory');
			if (storedOrders) {
				setOrders(JSON.parse(storedOrders));
			}
		}
		if (user?.id) {
			if (user.role === 'vendor' && user.stall) {
				loadVendorOrders();
			} else {
				loadOrderHistory();
			}
		}
	}, [user?.id, user?.role, user?.stall]);

	const loadOrderHistory = async () => {
		if (!user) return;
		if (!hasSupabase) {
			// Load from localStorage only
			return;
		}
		try {
			const supabase = getSupabase();
			if (!supabase) return;
			
			const { data, error } = await supabase
				.from('orders')
				.select('*')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false });

			if (error) throw error;

			// Convert Supabase data to Order format
			const convertedOrders = (data || []).map((dbOrder: any) => ({
				orderId: dbOrder.order_id,
				userId: dbOrder.user_id,
				userName: dbOrder.user_name,
				items: dbOrder.items,
				subtotal: dbOrder.total * 0.9,
				tax: dbOrder.total * 0.1,
				total: dbOrder.total,
				paymentMethod: dbOrder.payment_method,
				orderType: 'now' as const,
				reservationType: dbOrder.reservation_type,
				reservationDate: dbOrder.reservation_date,
				reservationTime: dbOrder.reservation_time,
				status: dbOrder.status,
				timestamp: new Date(dbOrder.created_at).getTime(),
				date: new Date(dbOrder.created_at).toLocaleDateString(),
			}));
			
			setOrders(convertedOrders);
			// Also update localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('orderHistory', JSON.stringify(convertedOrders));
			}
		} catch (err) {
			console.error('Error loading orders:', err);
		}
	};

	const loadVendorOrders = async () => {
		if (!user?.stall) return;
		if (!hasSupabase) {
			// Load from localStorage only
			return;
		}
		try {
			const supabase = getSupabase();
			if (!supabase) return;
			
			// Load all orders that contain items from this vendor
			const { data, error } = await supabase
				.from('orders')
				.select('*')
				.eq('vendor_id', user.stall)
				.order('created_at', { ascending: false });

			if (error) throw error;

			// Convert Supabase data to Order format
			const convertedOrders = (data || []).map((dbOrder: any) => ({
				orderId: dbOrder.order_id,
				userId: dbOrder.user_id,
				userName: dbOrder.user_name,
				items: dbOrder.items,
				subtotal: dbOrder.total * 0.9,
				tax: dbOrder.total * 0.1,
				total: dbOrder.total,
				paymentMethod: dbOrder.payment_method,
				orderType: 'now' as const,
				reservationType: dbOrder.reservation_type,
				reservationDate: dbOrder.reservation_date,
				reservationTime: dbOrder.reservation_time,
				status: dbOrder.status,
				timestamp: new Date(dbOrder.created_at).getTime(),
				date: new Date(dbOrder.created_at).toLocaleDateString(),
			}));
			
			setOrders(convertedOrders);
			// Also update localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('vendorOrders', JSON.stringify(convertedOrders));
			}
		} catch (err) {
			console.error('Error loading vendor orders:', err);
		}
	};

	const refreshOrders = async () => {
		if (user?.role === 'vendor' && user?.stall) {
			await loadVendorOrders();
		} else if (user?.id) {
			await loadOrderHistory();
		}
	};

	const login = (userData: User) => {
		setUser(userData);
	};

	const logout = () => {
		setUser(null);
		setRole(null);
		setCart([]);
	};

	const addToCart = (item: any) => {
		setCart(prevCart => [...prevCart, { ...item, cartId: Date.now() + Math.random() }]);
	};

	const removeFromCart = (cartId: string) => {
		setCart(cart.filter(item => item.cartId !== cartId));
	};

	const clearCart = () => {
		setCart([]);
	};

	const addOrder = async (order: Order) => {
		try {
			if (!hasSupabase) {
				// Fallback: just save locally
				const updatedOrders = [order, ...orders];
				setOrders(updatedOrders);
				if (typeof window !== 'undefined') {
					localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
				}
				toast.success('Order saved locally (Supabase not configured)');
				return;
			}

			const supabase = getSupabase();
			if (!supabase) return;

			// Insert into Supabase
			const vendorId = order.items[0]?.vendorId || 'unknown';
			const vendorName = order.items[0]?.vendorName || 'Unknown Vendor';
			
			// Prepare order data for Supabase
			const orderData: any = {
				order_id: order.orderId,
				user_id: order.userId,
				user_name: order.userName,
				vendor_id: vendorId,
				vendor_name: vendorName,
				items: order.items,
				total: order.total,
				status: 'pending',
				payment_method: order.paymentMethod,
			};

			// Add reservation fields only if they exist
			if (order.reservationType) {
				orderData.reservation_type = order.reservationType;
			}
			if (order.reservationDate) {
				orderData.reservation_date = order.reservationDate;
			}
			if (order.reservationTime) {
				orderData.reservation_time = order.reservationTime;
			}
			
			const { data, error } = await supabase
				.from('orders')
				.insert([orderData])
				.select();

			if (error) {
				// If error is about missing columns, save locally and warn user
				if (error.code === 'PGRST204' || error.message?.includes('column')) {
					console.warn('Supabase schema needs update. Saving to localStorage only.');
					toast.warning('Database schema needs update', {
						description: 'Order saved locally. Please run the migration SQL.',
					});
					// Continue with local save below
				} else {
					throw error;
				}
			} else {
				// Refresh orders after adding
				await refreshOrders();
			}

			// Create vendor_order record for QR scanning
			for (const item of order.items) {
				await supabase.from('vendor_orders').insert([{
					order_id: order.orderId,
					vendor_id: item.vendorId,
					status: 'pending',
				}]);
			}

			// Update local state
			const updatedOrders = [order, ...orders];
			setOrders(updatedOrders);
			
			// Also save to localStorage for backup
			if (typeof window !== 'undefined') {
				localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
			}
			
			toast.success('Order saved successfully!');
		} catch (err) {
			console.error('Error saving order:', err);
			toast.error('Failed to save order');
			throw err;
		}
	};

	const getOrderHistory = () => {
		if (!user) return [];
		return orders.filter(order => order.userId === user.id);
	};

	const repeatOrder = (orderId: string) => {
		const orderToRepeat = orders.find(order => order.orderId === orderId);
		if (orderToRepeat) {
			const newCartItems = orderToRepeat.items.map(item => ({ ...item, cartId: Date.now() + Math.random() }));
			setCart(newCartItems);
		}
	};

	const updateOrderStatus = async (orderId: string, status: string) => {
		try {
			if (!hasSupabase) {
				// Update local state only
				const updated = orders.map(o => o.orderId === orderId ? { ...o, status } : o);
				setOrders(updated);
				if (typeof window !== 'undefined') {
					localStorage.setItem('orderHistory', JSON.stringify(updated));
				}
				return;
			}

			const supabase = getSupabase();
			if (!supabase) return;

			const { error } = await supabase
				.from('orders')
				.update({ status, updated_at: new Date() })
				.eq('order_id', orderId);

			if (error) throw error;
			await refreshOrders();
		} catch (err) {
			console.error('Error updating order:', err);
			throw err;
		}
	};

	const markOrderReady = async (orderId: string) => {
		try {
			if (!hasSupabase) {
				// Update local orders
				const updated = orders.map(o => o.orderId === orderId ? { ...o, status: 'ready' } : o);
				setOrders(updated);
				if (typeof window !== 'undefined') {
					localStorage.setItem('orderHistory', JSON.stringify(updated));
				}
				toast.success('Order marked as ready (local)');
				return;
			}

			const supabase = getSupabase();
			if (!supabase) return;

			// Update vendor_orders table
			const { error: vendorError } = await supabase
				.from('vendor_orders')
				.update({ status: 'ready', completed_at: new Date() })
				.eq('order_id', orderId);

			if (vendorError) throw vendorError;

			// Update main orders table
			await updateOrderStatus(orderId, 'ready');
			
			toast.success('Order marked as ready!');
		} catch (err) {
			console.error('Error marking order ready:', err);
			toast.error('Failed to mark order as ready');
			throw err;
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				role,
				cart,
				orders,
				login,
				logout,
				setRole,
				addToCart,
				removeFromCart,
				clearCart,
				addOrder,
				getOrderHistory,
				repeatOrder,
				updateOrderStatus,
				markOrderReady,
				loadVendorOrders,
				refreshOrders,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
};

