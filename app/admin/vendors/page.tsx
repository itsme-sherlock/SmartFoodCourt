'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogOut, Users, Store, TrendingUp, AlertTriangle } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';
import { useEffect, useState } from 'react';
import { mockVendors } from '@/lib/mockData';

export default function AdminVendors() {
  const router = useRouter();
  const { user, logout, getVendorPerformance } = useAuth();
  const [vendorPerformance, setVendorPerformance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const performance = await getVendorPerformance();
        if (performance.length > 0) {
          setVendorPerformance(performance);
        } else {
          // Use mock data if no real data
          setVendorPerformance([
            { name: 'North Indian Delights', orders: 45, rating: 4.5, waste: '8%', revenue: 11250 },
            { name: 'South Indian Express', orders: 38, rating: 4.2, waste: '6%', revenue: 9500 },
            { name: 'Grill Master', orders: 22, rating: 4.7, waste: '5%', revenue: 8750 },
            { name: 'Happy Bites', orders: 15, rating: 4.0, waste: '10%', revenue: 3750 },
          ]);
        }
      } catch (error) {
        console.error('Error loading vendor data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getVendorPerformance]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWasteColor = (waste: string) => {
    const wasteNum = parseInt(waste);
    if (wasteNum > 10) return 'text-red-600';
    if (wasteNum > 7) return 'text-yellow-600';
    return 'text-green-600';
  };

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
            <h1 className="text-2xl font-bold text-red-600">🏪 Vendor Management</h1>
            <p className="text-gray-600 text-sm">Manage and monitor all food court vendors</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-600 hover:underline">
              📊 Dashboard
            </Link>
            <Link href="/admin/vendors" className="text-red-600 hover:underline font-semibold">
              🏪 Vendors
            </Link>
            <Link href="/admin/analytics" className="text-gray-600 hover:underline">
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
        {/* Vendor Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Vendors</p>
                <p className="text-3xl font-bold text-gray-800">{mockVendors.length}</p>
              </div>
              <Store className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Vendors</p>
                <p className="text-3xl font-bold text-green-600">
                  {mockVendors.filter(v => v.status === 'Open').length}
                </p>
              </div>
              <Users className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{vendorPerformance.reduce((sum, v) => sum + (v.revenue || 0), 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">High Waste Alert</p>
                <p className="text-3xl font-bold text-red-600">
                  {vendorPerformance.filter(v => parseInt(v.waste) > 8).length}
                </p>
              </div>
              <AlertTriangle className="text-red-600" size={32} />
            </div>
          </div>
        </div>

        {/* Vendor Management Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockVendors.map((vendor) => {
            const performance = vendorPerformance.find(p => p.name === vendor.name) || {
              orders: 0, rating: vendor.rating, waste: '5%', revenue: 0
            };

            return (
              <div key={vendor.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{vendor.logo}</span>
                    <div>
                      <h3 className="font-bold text-gray-800">{vendor.name}</h3>
                      <p className="text-sm text-gray-600">{vendor.cuisine.join(', ')}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vendor.status)}`}>
                    {vendor.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Today's Orders</span>
                    <span className="font-semibold">{performance.orders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rating</span>
                    <span className="font-semibold">⭐ {performance.rating}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Waste</span>
                    <span className={`font-semibold ${getWasteColor(performance.waste)}`}>
                      {performance.waste}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue</span>
                    <span className="font-semibold text-green-600">
                      ₹{performance.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition">
                    View Details
                  </button>
                  <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium transition">
                    Manage Menu
                  </button>
                </div>

                {vendor.isPopup && (
                  <div className="mt-3 bg-orange-100 border border-orange-300 rounded p-2">
                    <p className="text-xs text-orange-800 font-medium">🎪 Pop-up Vendor</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition">
              ➕ Add New Vendor
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition">
              📊 Generate Report
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition">
              ⚙️ System Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
