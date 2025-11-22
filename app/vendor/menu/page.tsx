'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMenu, MenuItem } from '@/context/MenuContext';
import { ChevronLeft, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function VendorMenuManager() {
	const router = useRouter();
	const { user, logout } = useAuth();
	const { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, updateItemStatus } = useMenu();
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [formData, setFormData] = useState<Partial<MenuItem>>({
		name: '',
		description: '',
		basePrice: undefined,
		sizes: { small: 0, medium: 0, large: 0 },
		status: 'Ready',
		allergens: [],
	});

	// Get menu items directly from context - will re-render on any changes
	const menuItems = user?.stall ? getMenuItems(user.stall) : [];

	useEffect(() => {
		if (!user || user.role !== 'vendor') {
			router.push('/');
			return;
		}
		console.log('Vendor Menu Page - User:', user?.name, 'Stall:', user?.stall, 'Menu Items:', menuItems);
	}, [user, router, menuItems]);

	const handleLogout = () => {
		logout();
		router.push('/');
	};

	const resetForm = () => {
		setFormData({
			name: '',
			description: '',
			basePrice: undefined,
			sizes: { small: 0, medium: 0, large: 0 },
			status: 'Ready',
			allergens: [],
		});
		setEditingId(null);
		setShowAddForm(false);
	};

	const handleAddItem = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name?.trim() || !formData.description?.trim() || !formData.basePrice) {
			alert('Please fill in all fields');
			return;
		}

		const newItem: MenuItem = {
			id: editingId || `item_${Date.now()}`,
			name: formData.name,
			description: formData.description,
			basePrice: formData.basePrice,
			sizes: formData.sizes || { small: 0, medium: 0, large: 0 },
			status: (formData.status as MenuItem['status']) || 'Ready',
			orderCount: editingId ? (menuItems.find(i => i.id === editingId)?.orderCount || 0) : 0,
			allergens: formData.allergens || [],
		};

		if (editingId && user?.stall) {
			updateMenuItem(user.stall, editingId, newItem);
		} else if (user?.stall) {
			addMenuItem(user.stall, newItem);
		}

		resetForm();
	};

	const handleEditItem = (item: MenuItem) => {
		setFormData(item);
		setEditingId(item.id);
		setShowAddForm(true);
	};

	const handleDeleteItem = (itemId: string) => {
		if (confirm('Are you sure you want to delete this item?') && user?.stall) {
			deleteMenuItem(user.stall, itemId);
		}
	};

	const handleStatusChange = (itemId: string, newStatus: MenuItem['status']) => {
		if (user?.stall) {
			updateItemStatus(user.stall, itemId, newStatus);
		}
	};

	const statusColors: Record<string, string> = {
		Ready: 'bg-green-100 text-green-800',
		Preparing: 'bg-blue-100 text-blue-800',
		Scheduled: 'bg-yellow-100 text-yellow-800',
		'Sold Out': 'bg-red-100 text-red-800',
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm">
				<div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
					<div className="flex items-center gap-4">
						<Link href="/vendor/dashboard" className="text-blue-600 hover:text-blue-800">
							<ChevronLeft size={24} />
						</Link>
						<div>
							<h1 className="text-2xl font-bold text-gray-800">📋 Menu Manager</h1>
							<p className="text-gray-600 text-sm">{user?.stallName || 'Vendor Menu'} (Stall: {user?.stall})</p>
						</div>
					</div>
					<button
						onClick={handleLogout}
						className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
					>
						Logout
					</button>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-4 py-8">
				{/* Debug info */}
				<div className="mb-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
					Loaded {menuItems.length} items from MenuContext
				</div>
				{/* Add New Item Button */}
				<div className="mb-6">
					<button
						onClick={() => {
							setShowAddForm(!showAddForm);
							if (!showAddForm) {
								setEditingId(null);
								resetForm();
							}
						}}
						className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
					>
						<Plus size={20} /> {editingId ? 'Edit Item' : 'Add New Item'}
					</button>
				</div>

				{/* Add/Edit Form */}
				{showAddForm && (
					<div className="bg-white rounded-lg shadow-md p-6 mb-8">
						<h2 className="text-xl font-bold text-gray-800 mb-4">
							{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
						</h2>
						<form onSubmit={handleAddItem} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
									<input
										type="text"
										value={formData.name || ''}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										placeholder="e.g., Paneer Tikka"
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹) *</label>
									<input
										type="number"
										value={formData.basePrice || ''}
										onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
										placeholder="Enter price"
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
										required
										step="1"
										min="1"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
								<textarea
									value={formData.description || ''}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									placeholder="Describe the item..."
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
									required
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Small Size (₹)</label>
									<input
										type="number"
										value={formData.sizes?.small || 0}
										onChange={(e) =>
											setFormData({
												...formData,
												sizes: { ...formData.sizes!, small: Number(e.target.value) },
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Medium Size (₹)</label>
									<input
										type="number"
										value={formData.sizes?.medium || 0}
										onChange={(e) =>
											setFormData({
												...formData,
												sizes: { ...formData.sizes!, medium: Number(e.target.value) },
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Large Size (₹)</label>
									<input
										type="number"
										value={formData.sizes?.large || 0}
										onChange={(e) =>
											setFormData({
												...formData,
												sizes: { ...formData.sizes!, large: Number(e.target.value) },
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
								<select
									value={formData.status || 'Ready'}
									onChange={(e) => setFormData({ ...formData, status: e.target.value as MenuItem['status'] })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
								>
									<option value="Ready">Ready</option>
									<option value="Preparing">Preparing</option>
									<option value="Scheduled">Scheduled</option>
									<option value="Sold Out">Sold Out</option>
								</select>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									type="submit"
									className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
								>
									<Check size={18} /> {editingId ? 'Update Item' : 'Add Item'}
								</button>
								<button
									type="button"
									onClick={resetForm}
									className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
								>
									<X size={18} /> Cancel
								</button>
							</div>
						</form>
					</div>
				)}

				{/* Menu Items List */}
				<div className="bg-white rounded-lg shadow-md overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-100 border-b">
								<tr>
									<th className="px-6 py-3 text-left font-bold text-gray-800">Item Name</th>
									<th className="px-6 py-3 text-left font-bold text-gray-800">Description</th>
									<th className="px-6 py-3 text-left font-bold text-gray-800">Price (₹)</th>
									<th className="px-6 py-3 text-left font-bold text-gray-800">Status</th>
									<th className="px-6 py-3 text-left font-bold text-gray-800">Orders</th>
									<th className="px-6 py-3 text-left font-bold text-gray-800">Actions</th>
								</tr>
							</thead>
							<tbody>
								{menuItems.map((item) => (
									<tr key={item.id} className="border-b hover:bg-gray-50">
										<td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
										<td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
											{item.description}
										</td>
										<td className="px-6 py-4 font-semibold text-gray-900">₹{item.basePrice}</td>
										<td className="px-6 py-4">
											<select
												value={item.status}
												onChange={(e) =>
													handleStatusChange(item.id, e.target.value as MenuItem['status'])
												}
												className={`px-3 py-1 rounded-full text-sm font-semibold border-0 focus:outline-none focus:ring-2 ${statusColors[item.status]}`}
											>
												<option value="Ready">Ready</option>
												<option value="Preparing">Preparing</option>
												<option value="Scheduled">Scheduled</option>
												<option value="Sold Out">Sold Out</option>
											</select>
										</td>
										<td className="px-6 py-4 text-gray-600 font-semibold">{item.orderCount}</td>
										<td className="px-6 py-4 flex gap-2">
											<button
												onClick={() => handleEditItem(item)}
												className="text-blue-600 hover:text-blue-800 font-semibold"
											>
												<Edit2 size={18} />
											</button>
											<button
												onClick={() => handleDeleteItem(item.id)}
												className="text-red-600 hover:text-red-800 font-semibold"
											>
												<Trash2 size={18} />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{menuItems.length === 0 && (
						<div className="p-8 text-center">
							<p className="text-gray-500 text-lg">No menu items yet. Add your first item!</p>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
