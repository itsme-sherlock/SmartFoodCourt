'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function VendorMenu() {
  const router = useRouter();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });

  const mockItems = [
    { id: 1, name: 'Butter Chicken', price: '₹250', status: 'Available' },
    { id: 2, name: 'Dal Makhani', price: '₹180', status: 'Available' },
    { id: 3, name: 'Paneer Tikka', price: '₹220', status: 'Out of Stock' },
  ];

  const handleAddItem = () => {
    if (formData.name && formData.price) {
      alert('Item added successfully!');
      setFormData({ name: '', description: '', price: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Menu Manager</h1>
          <Link href="/vendor/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border border-gray-300 rounded px-4 py-2"
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border border-gray-300 rounded px-4 py-2"
              />
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="border border-gray-300 rounded px-4 py-2"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddItem}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
              >
                Save Item
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Item Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg mb-8"
          >
            <Plus size={20} /> Add New Item
          </button>
        )}

        {/* Menu Items Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-gray-800">Item Name</th>
                <th className="px-6 py-3 text-left font-bold text-gray-800">Price</th>
                <th className="px-6 py-3 text-left font-bold text-gray-800">Status</th>
                <th className="px-6 py-3 text-left font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockItems.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{item.name}</td>
                  <td className="px-6 py-3 font-semibold">{item.price}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      item.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button className="text-blue-500 hover:text-blue-700">
                      <Edit2 size={18} />
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
