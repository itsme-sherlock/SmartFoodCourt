'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogOut, BarChart3, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';
import { useEffect, useState } from 'react';
import { VendorPerformance } from '@/lib/types';

export default function AdminAnalytics() {
  const router = useRouter();
  const { user, logout, getAdminStats, getVendorPerformance } = useAuth();
  const [adminStats, setAdminStats] = useState({
    totalVendors: 4,
    todayOrders: 0,
    activeOrders: 0,
    todayRevenue: 0,
    avgWaitTime: '8 mins',
  });
  const [vendorPerformance, setVendorPerformance] = useState<VendorPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stats, performance] = await Promise.all([
          getAdminStats(),
          getVendorPerformance(),
        ]);
        setAdminStats(stats);
        if (performance.length > 0) {
          setVendorPerformance(performance);
        } else {
          // Mock data for demo
          setVendorPerformance([
            { name: 'North Indian Delights', orders: 45, rating: 4.5, waste: '8%', revenue: 11250 },
            { name: 'South Indian Express', orders: 38, rating: 4.2, waste: '6%', revenue: 9500 },
            { name: 'Grill Master', orders: 22, rating: 4.7, waste: '5%', revenue: 8750 },
            { name: 'Happy Bites', orders: 15, rating: 4.0, waste: '10%', revenue: 3750 },
          ]);
        }
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getAdminStats, getVendorPerformance]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu */}
      <MobileMenu
        links={[
          { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
          { href: '/admin/vendors', label: 'Vendors', icon: '🏪' },
          { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
          { href: '/admin/billing', label: 'Billing', icon: '💰' },
          { href: '/admin/campaigns', label: 'Campaigns', icon: '🎉' }
        ]}
        onLogout={handleLogout}
        user={user}
      />

      {/* Header */}
      <header className="bg-white shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-red-600">📊 Analytics Dashboard</h1>
            <p className="text-gray-600 text-sm">Detailed insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-600 hover:underline">
              📊 Dashboard
            </Link>
            <Link href="/admin/vendors" className="text-gray-600 hover:underline">
              🏪 Vendors
            </Link>
            <Link href="/admin/analytics" className="text-red-600 hover:underline font-semibold">
              📈 Analytics
            </Link>
            <Link href="/admin/billing" className="text-blue-600 hover:underline">
              💳 Billing
            </Link>
            <Link href="/admin/hybrid-policies" className="text-blue-600 hover:underline">
              🔄 Hybrid
            </Link>
            <Link href="/admin/campaigns" className="text-blue-600 hover:underline">
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
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders (Today)</p>
                <p className="text-3xl font-bold text-blue-600">
                  {isLoading ? '...' : adminStats.todayOrders}
                </p>
                <p className="text-xs text-green-600 mt-1">+12% from yesterday</p>
              </div>
              <BarChart3 className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Revenue Growth</p>
                <p className="text-3xl font-bold text-green-600">
                  +18%
                </p>
                <p className="text-xs text-gray-500 mt-1">vs last week</p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Customer Satisfaction</p>
                <p className="text-3xl font-bold text-yellow-600">
                  4.3⭐
                </p>
                <p className="text-xs text-gray-500 mt-1">Average rating</p>
              </div>
              <Users className="text-yellow-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Order Value</p>
                <p className="text-3xl font-bold text-purple-600">
                  ₹{adminStats.todayRevenue > 0 ? Math.round(adminStats.todayRevenue / adminStats.todayOrders) : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">per order</p>
              </div>
              <DollarSign className="text-purple-600" size={32} />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend (Last 7 Days)</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {[6, 78, 82, 75, 88, 9, 12].map((value, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-blue-500 rounded-t w-full mb-2"
                    style={{ height: `${(value / 100) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-500">Day {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Volume Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Order Volume by Hour</h3>
            <div className="h-64 flex items-end justify-between space-x-1">
              {[2, 5, 8, 15, 25, 35, 42, 38, 28, 18, 12, 6].map((orders, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-green-500 rounded-t w-full mb-2"
                    style={{ height: `${(orders / 50) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-500">{idx + 8}:00</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Performing Vendors */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Top Vendors by Revenue</h3>
            <div className="space-y-3">
              {vendorPerformance
                .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
                .slice(0, 5)
                .map((vendor, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">#{idx + 1}</span>
                      <span className="font-medium">{vendor.name}</span>
                    </div>
                    <span className="font-bold text-green-600">₹{vendor.revenue.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Order Status Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <span className="text-sm font-medium">15%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Preparing</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  <span className="text-sm font-medium">35%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ready</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Completed</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Insights</h3>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Peak Hours</p>
                <p className="text-xs text-green-600">12-2 PM & 7-9 PM</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Top Cuisine</p>
                <p className="text-xs text-blue-600">North Indian (45%)</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Avg Wait Time</p>
                <p className="text-xs text-yellow-600">{adminStats.avgWaitTime}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-800">High Waste Alert</p>
                <p className="text-xs text-red-600">
                  {vendorPerformance.filter(v => parseInt(v.waste) > 8).length} vendors
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Export & Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Reports & Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition">
              📊 Export Daily Report
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition">
              📈 Generate Weekly Summary
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition">
              🎯 Performance Alerts
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium transition">
              📧 Send Analytics Email
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
