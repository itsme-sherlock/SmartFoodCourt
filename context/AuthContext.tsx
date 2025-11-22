"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabase, hasSupabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { VendorPerformance, BillingTransaction } from '@/lib/types';

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
	dateISO?: string;
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
	updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
	markOrderReady: (orderId: string) => Promise<void>;
	loadVendorOrders: () => Promise<void>;
	refreshOrders: () => Promise<void>;
	getAdminStats: () => Promise<{
		totalVendors: number;
		todayOrders: number;
		activeOrders: number;
		todayRevenue: number;
		avgWaitTime: string;
	}>;
	getVendorPerformance: () => Promise<VendorPerformance[]>;
	getBillingTransactions: () => Promise<BillingTransaction[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [role, setRole] = useState<'employee' | 'vendor' | 'admin' | null>(null);
	const [cart, setCart] = useState<any[]>([]);
	const [orders, setOrders] = useState<Order[]>([]);

	// Load user and orders from localStorage on mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			// Load user from localStorage
			const storedUser = localStorage.getItem('currentUser');
			if (storedUser) {
				const userData = JSON.parse(storedUser);
				setUser(userData);
				setRole(userData.role);
			}

			// Load orders from localStorage
			const storedOrders = localStorage.getItem('orderHistory');
			if (storedOrders) {
				setOrders(JSON.parse(storedOrders));
			}
		}
	}, []);

	// Load data when user changes
	useEffect(() => {
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
			if (typeof window !== 'undefined') {
				const storedOrders = localStorage.getItem('orderHistory');
				if (storedOrders) {
					const parsedOrders = JSON.parse(storedOrders);
					// Filter to only show this user's orders
					const userOrders = parsedOrders.filter((order: Order) => order.userId === user.id);
					setOrders(userOrders);
				}
			}
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
				reservationType: dbOrder.reservation_type || undefined,
				reservationDate: dbOrder.reservation_date || undefined,
				reservationTime: dbOrder.reservation_time || undefined,
				status: dbOrder.status as Order['status'],
				timestamp: new Date(dbOrder.created_at).getTime(),
				date: new Date(dbOrder.created_at).toLocaleDateString(),
				dateISO: dbOrder.created_at ? new Date(dbOrder.created_at).toISOString().split('T')[0] : undefined,
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
			if (typeof window !== 'undefined') {
				const storedOrders = localStorage.getItem('orderHistory');
				if (storedOrders) {
					const parsedOrders = JSON.parse(storedOrders);
					// Filter to only show orders for this vendor
					const vendorOrders = parsedOrders.filter((order: Order) =>
						order.items && order.items.some((item: any) => item.vendorId === user.stall)
					);
					setOrders(vendorOrders);
				}
			}
			return;
		}
		try {
			const supabase = getSupabase();
			if (!supabase) return;
			
			const yesterday = new Date();
        	yesterday.setDate(yesterday.getDate() - 1);

			// Load all orders that contain items from this vendor
			const { data, error } = await supabase
				.from('orders')
				.select('*')
				.gte('created_at', yesterday.toISOString())
				.order('created_at', { ascending: false });

			if (error) throw error;

			// Convert Supabase data to Order format
			const allOrders = (data || []).map((dbOrder: any) => ({
				orderId: dbOrder.order_id,
				userId: dbOrder.user_id,
				userName: dbOrder.user_name,
				items: dbOrder.items,
				subtotal: dbOrder.total * 0.9,
				tax: dbOrder.total * 0.1,
				total: dbOrder.total,
				paymentMethod: dbOrder.payment_method,
				orderType: 'now' as const,
				reservationType: dbOrder.reservation_type || undefined,
				reservationDate: dbOrder.reservation_date || undefined,
				reservationTime: dbOrder.reservation_time || undefined,
				status: dbOrder.status as Order['status'],
				timestamp: new Date(dbOrder.created_at).getTime(),
				date: new Date(dbOrder.created_at).toLocaleDateString(),
				dateISO: dbOrder.created_at ? new Date(dbOrder.created_at).toISOString().split('T')[0] : undefined,
			}));

			const vendorOrders = allOrders.filter(order => 
				order.items.some((item: any) => item.vendorId === user.stall)
			);
			
			setOrders(vendorOrders);
			// Also update localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('vendorOrders', JSON.stringify(vendorOrders));
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
		setRole(userData.role);
		
		// Save user to localStorage for persistence
		if (typeof window !== 'undefined') {
			localStorage.setItem('currentUser', JSON.stringify(userData));
		}
	};

	const logout = () => {
		setUser(null);
		setRole(null);
		setCart([]);
		
		// Clear user from localStorage
		if (typeof window !== 'undefined') {
			localStorage.removeItem('currentUser');
		}
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
				// Fallback: save to localStorage
				if (typeof window !== 'undefined') {
					// Load existing orders from localStorage (not from state which may be filtered)
					const storedOrders = localStorage.getItem('orderHistory');
					const existingOrders = storedOrders ? JSON.parse(storedOrders) : [];
					const updatedOrders = [order, ...existingOrders];
					
					// Save to localStorage
					localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
					
					// Update state based on user role
					if (user?.role === 'vendor' && user?.stall) {
						// For vendors, only show their orders
						const vendorOrders = updatedOrders.filter((o: Order) =>
							o.items && o.items.some((item: any) => item.vendorId === user.stall)
						);
						setOrders(vendorOrders);
					} else {
						// For employees, show their own orders
						const userOrders = updatedOrders.filter((o: Order) => o.userId === user?.id);
						setOrders(userOrders);
					}
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
					// Save locally only
					const updatedOrders = [order, ...orders];
					setOrders(updatedOrders);
					if (typeof window !== 'undefined') {
						localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
					}
					toast.success('Order saved locally!');
					return;
				} else {
					throw error;
				}
			}

			// Create vendor_order record for QR scanning
			for (const item of order.items) {
				try {
					await supabase.from('vendor_orders').insert([{
						order_id: order.orderId,
						vendor_id: item.vendorId,
						status: 'pending',
					}]);
				} catch (vendorOrderErr) {
					console.warn('Could not create vendor_order record:', vendorOrderErr);
				}
			}

			// Refresh orders from database to get the latest state
			await refreshOrders();
			
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

	const updateOrderStatus = async (orderId: string, status: Order['status']) => {
		try {
			// Update local orders state immediately for better UX
			const updated = orders.map(o =>
				o.orderId === orderId ? { ...o, status } : o
			);
			setOrders(updated);
			if (typeof window !== 'undefined') {
				const storageKey = user?.role === 'vendor' ? 'vendorOrders' : 'orderHistory';
				localStorage.setItem(storageKey, JSON.stringify(updated));
			}

			// If Supabase is available, try to sync with database
			if (hasSupabase) {
				try {
					const supabase = getSupabase();
					if (supabase) {
						const { error } = await supabase
							.from('orders')
							.update({ status, updated_at: new Date() })
							.eq('order_id', orderId);

						if (error) {
							console.warn('Warning: Could not sync with database:', error.message);
							// Local update already succeeded, so don't throw
						}
					}
				} catch (supabaseErr) {
					console.warn('Supabase sync failed, but local update succeeded:', supabaseErr);
					// Local update already succeeded, so don't throw
				}
			}
		} catch (err) {
			console.error('Error updating order status:', err);
			throw err;
		}
	};


	const markOrderReady = async (orderId: string) => {
		try {
			// Update local state immediately for better UX
			const updatedLocal = orders.map(o => o.orderId === orderId ? { ...o, status: 'ready' as const } : o);
			setOrders(updatedLocal);
			if (typeof window !== 'undefined') {
				const storageKey = user?.role === 'vendor' ? 'vendorOrders' : 'orderHistory';
				localStorage.setItem(storageKey, JSON.stringify(updatedLocal));
			}

			// If Supabase is available, try to sync with database
			if (hasSupabase) {
				try {
					const supabase = getSupabase();
					if (supabase) {
						// Update main orders table
						const { error: orderError } = await supabase
							.from('orders')
							.update({ status: 'ready', updated_at: new Date() })
							.eq('order_id', orderId);

						if (orderError) {
							console.warn('Warning: Could not sync order status with database:', orderError.message);
						}

						// Try to update vendor_orders table if it exists
						try {
							const { error: vendorOrderError } = await supabase
								.from('vendor_orders')
								.update({ status: 'ready', completed_at: new Date() })
								.eq('order_id', orderId);

							if (vendorOrderError) {
								console.warn('Warning: Could not sync vendor_orders:', vendorOrderError.message);
							}
						} catch (vendorErr) {
							// vendor_orders table might not exist, that's okay
							console.warn('vendor_orders table not available:', vendorErr);
						}
					}
				} catch (supabaseErr) {
					console.warn('Supabase sync failed, but local update succeeded:', supabaseErr);
				}
			}

			toast.success('Order marked as ready! 🎉');
		} catch (err) {
			console.error('Error marking order ready:', err);
			toast.error('Failed to mark order as ready');
			throw err;
		}
	};

	// Admin functions for dashboard stats
	const getAdminStats = async () => {
		if (!hasSupabase) {
			return {
				totalVendors: 4, // from mockVendors
				todayOrders: 0,
				activeOrders: 0,
				todayRevenue: 0,
				avgWaitTime: '8 mins', // mock
			};
		}

		try {
			const supabase = getSupabase();
			if (!supabase) return { totalVendors: 4, todayOrders: 0, activeOrders: 0, todayRevenue: 0, avgWaitTime: '8 mins' };

			const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

			// Get today's orders count
			const { data: todayOrdersData, error: todayError } = await supabase
				.from('orders')
				.select('order_id')
				.gte('created_at', `${today}T00:00:00.000Z`)
				.lt('created_at', `${today}T23:59:59.999Z`);

			if (todayError) throw todayError;

			// Get active orders (pending, preparing, ready)
			const { data: activeOrdersData, error: activeError } = await supabase
				.from('orders')
				.select('order_id')
				.in('status', ['pending', 'preparing', 'ready']);

			if (activeError) throw activeError;

			// Get today's revenue
			const { data: revenueData, error: revenueError } = await supabase
				.from('orders')
				.select('total')
				.gte('created_at', `${today}T00:00:00.000Z`)
				.lt('created_at', `${today}T23:59:59.999Z`);

			if (revenueError) throw revenueError;

			const todayRevenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

			return {
				totalVendors: 4, // from mockVendors.length
				todayOrders: todayOrdersData?.length || 0,
				activeOrders: activeOrdersData?.length || 0,
				todayRevenue,
				avgWaitTime: '8 mins', // mock for now
			};
		} catch (err) {
			console.error('Error getting admin stats:', err);
			return {
				totalVendors: 4,
				todayOrders: 0,
				activeOrders: 0,
				todayRevenue: 0,
				avgWaitTime: '8 mins',
			};
		}
	};

	const getVendorPerformance = async (): Promise<VendorPerformance[]> => {
		if (!hasSupabase) {
				// Return scaled mock data for enterprise campus use
				return [
					{ name: 'North Indian Delights', orders: 1_120, rating: 4.5, waste: '8%', revenue: 1_125_000 },
					{ name: 'South Indian Express', orders: 980, rating: 4.2, waste: '6%', revenue: 950_000 },
					{ name: 'Grill Master', orders: 740, rating: 4.7, waste: '5%', revenue: 875_000 },
					{ name: 'Happy Bites', orders: 540, rating: 4.0, waste: '10%', revenue: 375_000 },
				];
			}

		try {
			const supabase = getSupabase();
			if (!supabase) return [];

			const today = new Date().toISOString().split('T')[0];

			// Get vendor performance data
			const { data, error } = await supabase
				.from('orders')
				.select('vendor_id, vendor_name, total')
				.gte('created_at', `${today}T00:00:00.000Z`)
				.lt('created_at', `${today}T23:59:59.999Z`);

			if (error) throw error;

			// Group by vendor
			const vendorStats = (data || []).reduce((acc: any, order) => {
				const vendorId = order.vendor_id;
				if (!acc[vendorId]) {
					acc[vendorId] = {
						name: order.vendor_name,
						orders: 0,
						revenue: 0,
					};
				}
				acc[vendorId].orders += 1;
				acc[vendorId].revenue += order.total || 0;
				return acc;
			}, {});

			// Convert to array and add mock data for ratings and waste
			const mockWaste = { vendor_1: '8%', vendor_2: '6%', vendor_3: '5%', vendor_4: '10%' };
			const mockRatings = { vendor_1: 4.5, vendor_2: 4.2, vendor_3: 4.7, vendor_4: 4.0 };

			return Object.entries(vendorStats).map(([vendorId, stats]: [string, any]) => ({
				name: stats.name,
				orders: stats.orders,
				rating: mockRatings[vendorId as keyof typeof mockRatings] || 4.0,
				waste: mockWaste[vendorId as keyof typeof mockWaste] || '5%',
				revenue: stats.revenue,
			}));
		} catch (err) {
			console.error('Error getting vendor performance:', err);
			return [];
		}
	};

	const getBillingTransactions = async () => {
		if (!hasSupabase) {
			// Return mock data for demo
			return [
				{
					id: 'TXN001',
					orderId: 'ORD-001',
					vendorId: 'vendor_1',
					vendorName: 'North Indian Delights',
					customerName: 'Raj Kumar',
					amount: 350.00,
					commission: 35.00,
					netAmount: 315.00,
					paymentMethod: 'UPI',
					status: 'Completed',
					timestamp: new Date(new Date().setHours(12, 30, 0, 0)),
					items: ['Butter Chicken', 'Naan', 'Rice'],
				},
				{
					id: 'TXN002',
					orderId: 'ORD-002',
					vendorId: 'vendor_2',
					vendorName: 'South Indian Express',
					customerName: 'Priya Singh',
					amount: 180.00,
					commission: 18.00,
					netAmount: 162.00,
					paymentMethod: 'Card',
					status: 'Completed',
					timestamp: new Date(new Date().setHours(11, 45, 0, 0)),
					items: ['Masala Dosa', 'Filter Coffee'],
				},
			];
		}

		try {
			const supabase = getSupabase();
			if (!supabase) return [];

			// Get all orders for billing view
			const { data, error } = await supabase
				.from('orders')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) throw error;

			// Convert to billing transaction format
			const transactions = (data || []).map((order: any, index: number) => ({
				id: `TXN${String(index + 1).padStart(3, '0')}`,
				orderId: order.order_id,
				vendorId: order.vendor_id,
				vendorName: order.vendor_name,
				customerName: order.user_name,
				amount: order.total,
				commission: order.total * 0.1, // 10% commission
				netAmount: order.total * 0.9,
				paymentMethod: order.payment_method || 'UPI',
				status: order.status === 'completed' ? 'Completed' : 'Pending',
				timestamp: new Date(order.created_at),
				items: order.items.map((item: any) => item.name),
			}));

			return transactions;
		} catch (err) {
			console.error('Error getting billing transactions:', err);
			return [];
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
				getAdminStats,
				getVendorPerformance,
				getBillingTransactions,
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

