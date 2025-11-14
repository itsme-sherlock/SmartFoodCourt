import type { User } from "@/context/AuthContext"

export const mockEmployees: User[] = [
	{
		id: 'emp_1',
		name: 'Raj Kumar',
		employeeId: 'EMP001',
		email: 'raj@company.com',
		role: 'employee',
		loyaltyPoints: 250,
		preferences: {
			dietary: ['vegetarian'],
			favoriteVendors: ['vendor_1', 'vendor_2'],
		},
	},
	{
		id: 'emp_2',
		name: 'Priya Singh',
		employeeId: 'EMP002',
		email: 'priya@company.com',
		role: 'employee',
		loyaltyPoints: 150,
		preferences: {
			dietary: [],
			favoriteVendors: ['vendor_3'],
		},
	},
];

export const mockVendors = [
	{
		id: 'vendor_1',
		name: 'North Indian Delights',
		logo: '🍛',
		cuisine: ['North Indian', 'Vegetarian'],
		rating: 4.5,
		status: 'Open',
		operatingHours: '11:00 AM - 3:00 PM, 6:00 PM - 9:00 PM',
	},
	{
		id: 'vendor_2',
		name: 'South Indian Express',
		logo: '🫔',
		cuisine: ['South Indian', 'Vegetarian'],
		rating: 4.2,
		status: 'Open',
		operatingHours: '11:00 AM - 3:00 PM',
	},
	{
		id: 'vendor_3',
		name: 'Grill Master',
		logo: '🍗',
		cuisine: ['Grilled', 'Non-Vegetarian'],
		rating: 4.7,
		status: 'Open',
		operatingHours: '12:00 PM - 3:00 PM',
	},
	{
		id: 'vendor_4',
		name: 'Happy Bites Pop-up',
		logo: '🍕',
		cuisine: ['Continental'],
		rating: 4.0,
		status: 'Open',
		operatingHours: '11:30 AM - 2:30 PM',
		isPopup: true,
	},
];

export const mockMenuItems = {
	vendor_1: [
		{
			id: 'item_1_1',
			name: 'Butter Chicken',
			description: 'Creamy tomato-based curry',
			basePrice: 250,
			sizes: { small: 200, medium: 250, large: 300 },
			status: 'Ready',
			orderCount: 45,
			allergens: ['dairy'],
		},
		{
			id: 'item_1_2',
			name: 'Dal Makhani',
			description: 'Slow-cooked lentils',
			basePrice: 180,
			sizes: { small: 150, medium: 180, large: 220 },
			status: 'Ready',
			orderCount: 38,
			allergens: ['dairy'],
		},
		{
			id: 'item_1_3',
			name: 'Paneer Tikka Masala',
			description: 'Grilled cottage cheese',
			basePrice: 220,
			sizes: { small: 180, medium: 220, large: 280 },
			status: 'Preparing',
			orderCount: 3,
			allergens: ['dairy'],
		},
	],
	vendor_2: [
		{
			id: 'item_2_1',
			name: 'Masala Dosa',
			description: 'Crispy rice crepe',
			basePrice: 120,
			sizes: { small: 100, medium: 120, large: 150 },
			status: 'Ready',
			orderCount: 52,
			allergens: [],
		},
		{
			id: 'item_2_2',
			name: 'Idli with Sambar',
			description: 'Steamed rice cakes',
			basePrice: 80,
			sizes: { small: 60, medium: 80, large: 100 },
			status: 'Ready',
			orderCount: 2,
			allergens: [],
		},
	],
	vendor_3: [
		{
			id: 'item_3_1',
			name: 'Tandoori Chicken',
			description: 'Smoky grilled chicken',
			basePrice: 280,
			sizes: { small: 200, medium: 280, large: 350 },
			status: 'Ready',
			orderCount: 40,
			allergens: [],
		},
	],
	vendor_4: [
		{
			id: 'item_4_1',
			name: 'Margherita Pizza',
			description: 'Classic cheese pizza',
			basePrice: 150,
			sizes: { small: 120, medium: 150, large: 200 },
			status: 'Ready',
			orderCount: 25,
			allergens: ['dairy'],
		},
	],
};

export const mockTimeSlots = [
	{ slotId: 'slot_1', time: '12:00 PM', capacity: 50, currentOrders: 48 },
	{ slotId: 'slot_2', time: '12:30 PM', capacity: 50, currentOrders: 32 },
	{ slotId: 'slot_3', time: '1:00 PM', capacity: 50, currentOrders: 15 },
	{ slotId: 'slot_4', time: '1:30 PM', capacity: 50, currentOrders: 8 },
];

export const mockVendorUsers = [
	{
		id: 'vendor_user_1',
		name: 'Amit Sharma',
		vendorId: 'VEN001',
		email: 'amit@northindian.com',
		role: 'vendor' as const,
		stall: 'vendor_1',
		stallName: 'North Indian Delights',
	},
	{
		id: 'vendor_user_2',
		name: 'Lakshmi Iyer',
		vendorId: 'VEN002',
		email: 'lakshmi@southindian.com',
		role: 'vendor' as const,
		stall: 'vendor_2',
		stallName: 'South Indian Express',
	},
	{
		id: 'vendor_user_3',
		name: 'Mohammed Ali',
		vendorId: 'VEN003',
		email: 'ali@grillmaster.com',
		role: 'vendor' as const,
		stall: 'vendor_3',
		stallName: 'Grill Master',
	},
];

export const mockAdmins = [
	{
		id: 'admin_1',
		name: 'Food Court Manager',
		adminId: 'ADM001',
		email: 'manager@foodcourt.com',
		role: 'admin' as const,
	},
];
