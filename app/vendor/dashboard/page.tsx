'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogOut, Menu, TrendingUp, Clock } from 'lucide-react';

export default function VendorDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const mockStats = {
    todayOrders: 45,
    revenue: '₹8,500',
    avgPrepTime: '12 mins',
    rating: 4.5,
  };

  const mockOrders = [
    { id: 'ORD001', items: 3, time: '12:15 PM', status: 'Preparing' },
    { id: 'ORD002', items: 2, time: '12:30 PM', status: 'Ready' },
    { id: 'ORD003', items: 1, time: '12:45 PM', status: 'Scheduled' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-600">🏪 Vendor Dashboard</h1>
            <p className="text-gray-600 text-sm">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/vendor/menu" className="text-green-600 hover:underline">
              📋 Menu Manager
            </Link>
            <Link href="/vendor/analytics" className="text-green-600 hover:underline">
              📊 Analytics
            </Link>
            <Link href="/vendor/orders" className="text-blue-600 hover:underline font-bold">
              📦 Orders & QR Scanner
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Today's Orders</p>
            <p className="text-3xl font-bold text-green-600">{mockStats.todayOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Revenue</p>
            <p className="text-3xl font-bold text-blue-600">{mockStats.revenue}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Avg Prep Time</p>
            <p className="text-3xl font-bold text-yellow-600">{mockStats.avgPrepTime}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Rating</p>
            <p className="text-3xl font-bold text-purple-600">⭐ {mockStats.rating}</p>
          </div>
        </div>

        {/* Order Queue */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Orders</h2>
          <div className="space-y-3">
            {mockOrders.map(order => (
              <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-bold text-gray-800">{order.id}</p>
                  <p className="text-sm text-gray-600">{order.items} items • {order.time}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 rounded-lg font-semibold text-white ${
                    order.status === 'Preparing' ? 'bg-yellow-500' :
                    order.status === 'Ready' ? 'bg-green-500' :
                    'bg-blue-500'
                  }`}>
                    {order.status}
                  </span>
                  <select defaultValue={order.status} className="border border-gray-300 rounded px-3 py-2">
                    <option>Scheduled</option>
                    <option>Preparing</option>
                    <option>Ready</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
