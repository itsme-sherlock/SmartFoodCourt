"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
	id: string;
	name: string;
	role: 'employee' | 'vendor' | 'admin';
	email: string;
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
	addOrder: (order: Order) => void;
	getOrderHistory: () => Order[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [role, setRole] = useState<'employee' | 'vendor' | 'admin' | null>(null);
	const [cart, setCart] = useState<any[]>([]);
	const [orders, setOrders] = useState<Order[]>([]);

	// Load orders from localStorage on mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const storedOrders = localStorage.getItem('orderHistory');
			if (storedOrders) {
				setOrders(JSON.parse(storedOrders));
			}
		}
	}, []);

	const login = (userData: User) => {
		setUser(userData);
	};

	const logout = () => {
		setUser(null);
		setRole(null);
		setCart([]);
	};

	const addToCart = (item: any) => {
		setCart([...cart, { ...item, cartId: Date.now() }]);
	};

	const removeFromCart = (cartId: string) => {
		setCart(cart.filter(item => item.cartId !== cartId));
	};

	const clearCart = () => {
		setCart([]);
	};

	const addOrder = (order: Order) => {
		const updatedOrders = [order, ...orders];
		setOrders(updatedOrders);
		if (typeof window !== 'undefined') {
			localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
		}
	};

	const getOrderHistory = () => {
		if (!user) return [];
		return orders.filter(order => order.userId === user.id);
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

