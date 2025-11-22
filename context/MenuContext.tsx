'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { mockMenuItems } from '@/lib/mockData';
import { toast } from 'sonner';

export interface MenuItem {
	id: string;
	name: string;
	description: string;
	basePrice: number;
	sizes: { small: number; medium: number; large: number };
	status: 'Ready' | 'Preparing' | 'Scheduled' | 'Sold Out';
	orderCount: number;
	allergens: string[];
}

interface MenuContextType {
	getMenuItems: (vendorId: string) => MenuItem[];
	addMenuItem: (vendorId: string, item: MenuItem) => void;
	updateMenuItem: (vendorId: string, itemId: string, updatedItem: MenuItem) => void;
	deleteMenuItem: (vendorId: string, itemId: string) => void;
	updateItemStatus: (vendorId: string, itemId: string, status: MenuItem['status']) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

// Helper to get menu items from localStorage or defaults
const getMenuItemsFromStorage = (vendorId: string): MenuItem[] => {
	if (typeof window !== 'undefined') {
		const storedItems = localStorage.getItem(`menuItems_${vendorId}`);
		if (storedItems) {
			return JSON.parse(storedItems);
		}
	}
	const items = mockMenuItems[vendorId as keyof typeof mockMenuItems] || [];
	return items.map(item => ({
		...item,
		status: (item.status || 'Ready') as MenuItem['status'],
	}));
};

// Helper to save menu items to localStorage
const saveMenuItemsToStorage = (vendorId: string, items: MenuItem[]) => {
	if (typeof window !== 'undefined') {
		localStorage.setItem(`menuItems_${vendorId}`, JSON.stringify(items));
		// Dispatch a custom event to notify other components/tabs
		window.dispatchEvent(new Event('storage'));
	}
};

export const MenuProvider = ({ children }: { children: ReactNode }) => {
	// Pre-initialize state with actual data so items show immediately
	const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>(() => {
		if (typeof window !== 'undefined') {
			const vendorIds = ['vendor_1', 'vendor_2', 'vendor_3', 'vendor_4'];
			const allItems: Record<string, MenuItem[]> = {};
			vendorIds.forEach(vendorId => {
				allItems[vendorId] = getMenuItemsFromStorage(vendorId);
			});
			return allItems;
		}
		return {};
	});

	// Update from localStorage if data was added in a previous session or another tab
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const loadItems = () => {
				const vendorIds = ['vendor_1', 'vendor_2', 'vendor_3', 'vendor_4'];
				const allItems: Record<string, MenuItem[]> = {};

				vendorIds.forEach(vendorId => {
					allItems[vendorId] = getMenuItemsFromStorage(vendorId);
				});

				console.log('MenuContext re-checked items:', allItems);
				setMenuItems(allItems);
			};

			loadItems();

			// Listen for storage changes (cross-tab sync)
			const handleStorageChange = () => {
				console.log('Storage changed, reloading menu items...');
				loadItems();
			};

			window.addEventListener('storage', handleStorageChange);
			return () => window.removeEventListener('storage', handleStorageChange);
		}
	}, []);

	const getMenuItems = useCallback((vendorId: string): MenuItem[] => {
		const result = menuItems[vendorId] || [];
		console.log(`[MenuContext] getMenuItems called for ${vendorId}, returning ${result.length} items`);
		return result;
	}, [menuItems]);

	const addMenuItem = useCallback((vendorId: string, item: MenuItem) => {
		setMenuItems(prev => {
			const currentItems = prev[vendorId] || [];
			const updatedItems = [...currentItems, item];
			saveMenuItemsToStorage(vendorId, updatedItems);
			console.log(`[MenuContext] Added item "${item.name}" to ${vendorId}. New count: ${updatedItems.length}`);
			return { ...prev, [vendorId]: updatedItems };
		});
		toast.success(`${item.name} added to menu!`);
	}, []);

	const updateMenuItem = useCallback((vendorId: string, itemId: string, updatedItem: MenuItem) => {
		setMenuItems(prev => {
			const currentItems = prev[vendorId] || [];
			const updatedItems = currentItems.map(item =>
				item.id === itemId ? updatedItem : item
			);
			saveMenuItemsToStorage(vendorId, updatedItems);
			return { ...prev, [vendorId]: updatedItems };
		});
		toast.success('Menu item updated!');
	}, []);

	const deleteMenuItem = useCallback((vendorId: string, itemId: string) => {
		setMenuItems(prev => {
			const currentItems = prev[vendorId] || [];
			const updatedItems = currentItems.filter(item => item.id !== itemId);
			saveMenuItemsToStorage(vendorId, updatedItems);
			return { ...prev, [vendorId]: updatedItems };
		});
		toast.success('Menu item removed!');
	}, []);

	const updateItemStatus = useCallback((vendorId: string, itemId: string, status: MenuItem['status']) => {
		setMenuItems(prev => {
			const currentItems = prev[vendorId] || [];
			const updatedItems = currentItems.map(item =>
				item.id === itemId ? { ...item, status } : item
			);
			saveMenuItemsToStorage(vendorId, updatedItems);
			console.log(`[MenuContext] Updated item ${itemId} status to "${status}" in ${vendorId}`);
			return { ...prev, [vendorId]: updatedItems };
		});
		toast.success(`Status updated to ${status}!`);
	}, []);

	return (
		<MenuContext.Provider
			value={{
				getMenuItems,
				addMenuItem,
				updateMenuItem,
				deleteMenuItem,
				updateItemStatus,
			}}
		>
			{children}
		</MenuContext.Provider>
	);
};

export const useMenu = () => {
	const context = useContext(MenuContext);
	if (!context) {
		throw new Error('useMenu must be used within MenuProvider');
	}
	return context;
};
