'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MobileMenu from '@/components/MobileMenu';
import Link from 'next/link';
import type { Order } from '@/lib/types';

type TimeFilter = 'daily' | 'weekly' | 'monthly';
type ViewType = 'time' | 'vendor';
type OrderItem = {
  vendorName?: string;
  selectedPrice: number;
  quantity: number;
};

export default function SpendingTracker() {
  const router = useRouter();
  const { user, logout, getOrderHistory } = useAuth();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('daily');
  const [viewType, setViewType] = useState<ViewType>('time');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getOrderHistory());
  }, [getOrderHistory]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getFilteredData = () => {
    const now = new Date();
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.date);
      switch (timeFilter) {
        case 'daily':
          return orderDate.toDateString() === now.toDateString();
        case 'weekly':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          return orderDate >= weekStart;
        case 'monthly':
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });

    if (viewType === 'time') {
      return filtered.reduce((acc, order) => {
        const date = new Date(order.date).toLocaleDateString();
        acc[date] = (acc[date] || 0) + order.total;
        return acc;
      }, {} as Record<string, number>);
    } else {
      return filtered.reduce((acc, order) => {
        order.items.forEach((item: OrderItem) => {
          const vendor = item.vendorName || 'Unknown Vendor';
          acc[vendor] = (acc[vendor] || 0) + (item.selectedPrice * item.quantity);
        });
        return acc;
      }, {} as Record<string, number>);
    }
  };

  const getTotalSpending = () => {
    const values = Object.values(getFilteredData()) as number[];
    return values.reduce((sum, amount) => sum + amount, 0);
  };

  const mobileMenuLinks = [
    { label: '🏠 Home', href: '/employee/home' },
    { label: '📋 Order History', href: '/employee/history' },
    { label: '🗓️ Make a Reservation', href: '/employee/reservation' },
    { label: '💰 Spending Tracker', href: '/employee/spending' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* MOBILE MENU COMPONENT */}
      <MobileMenu
        userName={user?.name || 'Guest'}
        menuLinks={mobileMenuLinks}
        onLogout={handleLogout}
      />

      {/* DESKTOP HEADER */}
      <header className="bg-white shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">🍽️ Food Court</h1>
            <p className="text-gray-600 text-sm">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/employee/home" className="text-blue-600 hover:underline">
              🏠 Home
            </Link>
            <Link href="/employee/history" className="text-blue-600 hover:underline">
              📋 Order History
            </Link>
            <Link href="/employee/reservation" className="text-blue-600 hover:underline">
              🗓️ Make a Reservation
            </Link>
            <Link href="/employee/spending" className="text-blue-600 hover:underline font-bold">
              💰 Spending Tracker
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">💰 Personal Spending Tracker</h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View By</label>
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value as ViewType)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="time">By Date</option>
                <option value="vendor">By Vendor</option>
              </select>
            </div>
          </div>

          {/* Total Spending */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800">
              Total Spending ({timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)})
            </h3>
            <p className="text-3xl font-bold text-blue-600">₹{getTotalSpending().toFixed(2)}</p>
          </div>

          {/* Spending Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {viewType === 'time' ? 'Spending by Date' : 'Spending by Vendor'}
            </h3>
            {Object.keys(getFilteredData()).length === 0 ? (
              <p className="text-gray-600">No spending data available for the selected period.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(getFilteredData()).map(([key, amount]) => (
                  <div key={key} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                    <span className="font-medium text-gray-700">{key}</span>
                    <span className="font-bold text-green-600">₹{(amount as number).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}