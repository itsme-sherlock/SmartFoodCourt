'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { mockVendors } from '@/lib/mockData';
import { LogOut, Search, Repeat } from 'lucide-react';
import type { Order } from '@/context/AuthContext';

export default function EmployeeHome() {
  const router = useRouter();
  const { user, logout, cart, getOrderHistory, repeatOrder } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  useEffect(() => {
    const history = getOrderHistory();
    if (history.length > 0) {
      setLastOrder(history[0]);
    }
  }, [getOrderHistory]);

  const filteredVendors = mockVendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.cuisine.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleRepeatOrder = () => {
    if (lastOrder) {
      repeatOrder(lastOrder.orderId);
      router.push('/employee/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">🍽️ Food Court</h1>
            <p className="text-gray-600 text-sm">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/employee/history" className="text-blue-600 hover:underline">
              📋 Order History
            </Link>
            <Link href="/employee/reservation" className="text-blue-600 hover:underline">
              🗓️ Make a Reservation
            </Link>
            <Link href="/employee/profile" className="text-blue-600 hover:underline">
              👤 Profile
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
        {/* Search & Cart Info */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search vendors or cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="ml-4 bg-blue-100 px-4 py-2 rounded-lg">
            <p className="text-blue-700 font-semibold">Cart Items: {cart.length}</p>
          </div>
        </div>

        {/* Repeat Last Order */}
        {lastOrder && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-blue-800">Quick Reorder</h2>
                <p className="text-blue-700">Your last order from {lastOrder.items[0]?.vendorName}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {lastOrder.items.map((item, index) => (
                    <span key={index} className="bg-white text-gray-700 px-2 py-1 rounded text-sm">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={handleRepeatOrder}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                <Repeat size={18} /> Repeat Order (₹{lastOrder.total.toFixed(2)})
              </button>
            </div>
          </div>
        )}

        {/* Vendor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map(vendor => (
            <Link key={vendor.id} href={`/employee/vendor/${vendor.id}`}>
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer h-full">
                <div className="p-6">
                  <div className="text-5xl mb-3">{vendor.logo}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{vendor.name}</h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{vendor.rating}</span>
                    {vendor.isPopup && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">Pop-Up</span>}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {vendor.cuisine.map((c, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${vendor.status === 'Open' ? 'bg-green-500' : 'bg-gray-400'}`}>
                    {vendor.status}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
