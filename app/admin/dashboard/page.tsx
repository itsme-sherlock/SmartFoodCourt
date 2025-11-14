'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const adminStats = [
    { label: 'Total Vendors', value: '4', icon: '🏪' },
    { label: 'Active Orders', value: '127', icon: '📦' },
    { label: 'Today Revenue', value: '₹24,500', icon: '💰' },
    { label: 'Avg Wait Time', value: '8 mins', icon: '⏱️' },
  ];

  const vendorPerformance = [
    { name: 'North Indian Delights', orders: 45, rating: 4.5, waste: '8%' },
    { name: 'South Indian Express', orders: 38, rating: 4.2, waste: '6%' },
    { name: 'Grill Master', orders: 22, rating: 4.7, waste: '5%' },
    { name: 'Happy Bites', orders: 15, rating: 4.0, waste: '10%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-red-600">⚙️ Admin Control Center</h1>
            <p className="text-gray-600 text-sm">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/vendors" className="text-red-600 hover:underline">
              🏪 Vendors
            </Link>
            <Link href="/admin/analytics" className="text-red-600 hover:underline">
              📊 Analytics
            </Link>
            <Link href="/admin/campaigns" className="text-red-600 hover:underline">
              🎉 Campaigns
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {adminStats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6">
              <p className="text-2xl">{stat.icon}</p>
              <p className="text-gray-600 text-sm mt-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Vendor Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Vendor Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Vendor</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Orders</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Rating</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Waste %</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Status</th>
                </tr>
              </thead>
              <tbody>
                {vendorPerformance.map((vendor, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">{vendor.name}</td>
                    <td className="px-6 py-3">{vendor.orders}</td>
                    <td className="px-6 py-3">⭐ {vendor.rating}</td>
                    <td className="px-6 py-3">{vendor.waste}</td>
                    <td className="px-6 py-3">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
