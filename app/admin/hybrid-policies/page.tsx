'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogOut, TrendingDown, Users, DollarSign, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';

export default function AdminHybridPolicies() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Simple mock data for demo
  const hybridStats = [
    { 
      label: "Today's Attendance", 
      value: '60 employees', 
      icon: '👥',
      change: '↓40% from normal',
      color: 'text-blue-600'
    },
    { 
      label: 'Expected Waste Reduction', 
      value: '85%', 
      icon: '♻️',
      change: 'vs traditional model',
      color: 'text-green-600'
    },
    { 
      label: 'Expected Daily Savings', 
      value: '₹12,000', 
      icon: '💰',
      change: '₹4.32L saved/month',
      color: 'text-purple-600'
    },
    { 
      label: 'Prediction Accuracy', 
      value: '94%', 
      icon: '🎯',
      change: 'ML-powered forecasting',
      color: 'text-orange-600'
    },
  ];

  const employeePatterns = [
    { name: 'Fixed Schedule', employees: 45, pattern: '5 days/week', color: 'bg-blue-100 text-blue-800' },
    { name: 'Hybrid 3-Day', employees: 78, pattern: '3 days/week', color: 'bg-green-100 text-green-800' },
    { name: 'Flexible 10-Day', employees: 32, pattern: '10 days/month', color: 'bg-purple-100 text-purple-800' },
    { name: 'Custom Pattern', employees: 15, pattern: 'Variable', color: 'bg-orange-100 text-orange-800' },
  ];

  const vendorOptimization = [
    { 
      vendor: 'North Indian Delights', 
      tomorrow: '25 employees expected', 
      recommendation: 'Prepare 40% less',
      savings: '₹3,200',
      status: 'optimized'
    },
    { 
      vendor: 'South Indian Express', 
      tomorrow: '18 employees expected', 
      recommendation: 'Prepare 50% less',
      savings: '₹2,800',
      status: 'optimized'
    },
    { 
      vendor: 'Grill Master', 
      tomorrow: '12 employees expected', 
      recommendation: 'Prepare 35% less',
      savings: '₹1,900',
      status: 'optimized'
    },
    { 
      vendor: 'Happy Bites', 
      tomorrow: '8 employees expected', 
      recommendation: 'Prepare 45% less',
      savings: '₹1,500',
      status: 'pending'
    },
  ];

  // Mobile menu items
  const mobileMenuLinks = [
    { label: '📊 Dashboard', href: '/admin/dashboard' },
    { label: '🏪 Vendors', href: '/admin/vendors' },
    { label: '📈 Analytics', href: '/admin/analytics' },
    { label: '💳 Billing', href: '/admin/billing' },
    { label: '🔄 Hybrid Policies', href: '/admin/hybrid-policies' },
    { label: '🎉 Campaigns', href: '/admin/campaigns' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu */}
      <MobileMenu 
        userName={user?.name || 'Admin'} 
        menuLinks={mobileMenuLinks} 
        onLogout={handleLogout}
      />

      {/* Desktop Header */}
      <header className="bg-white shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">🔄 Hybrid Work Optimization</h1>
            <p className="text-gray-600 text-sm">AI-Powered Food Court Management</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
              📊 Dashboard
            </Link>
            <Link href="/admin/vendors" className="text-blue-600 hover:underline">
              🏪 Vendors
            </Link>
            <Link href="/admin/analytics" className="text-blue-600 hover:underline">
              📈 Analytics
            </Link>
            <Link href="/admin/billing" className="text-blue-600 hover:underline">
              💳 Billing
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
        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {hybridStats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-2xl">{stat.icon}</p>
                <span className={`text-xs font-semibold ${stat.color}`}>LIVE</span>
              </div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Employee Work Patterns */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Employee Work Patterns</h2>
            <div className="space-y-4">
              {employeePatterns.map((pattern, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-800">{pattern.name}</h3>
                    <p className="text-sm text-gray-600">{pattern.employees} employees</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${pattern.color}`}>
                    {pattern.pattern}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Optimization */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🍽️ Tomorrow's Vendor Optimization</h2>
            <div className="space-y-4">
              {vendorOptimization.map((vendor, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{vendor.vendor}</h3>
                    {vendor.status === 'optimized' ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <AlertTriangle className="text-yellow-500" size={20} />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">📈 {vendor.tomorrow}</p>
                  <p className="text-sm text-blue-600 font-semibold mb-1">💡 {vendor.recommendation}</p>
                  <p className="text-sm text-green-600 font-semibold">💰 Save: {vendor.savings}/day</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">🚀 AI-Powered Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📊 Prediction Engine</h3>
              <p className="text-sm">ML algorithms analyze employee patterns to predict daily attendance with 94% accuracy</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">♻️ Waste Reduction</h3>
              <p className="text-sm">Smart preparation recommendations have reduced food waste by 85% compared to traditional models</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">💰 Cost Optimization</h3>
              <p className="text-sm">Hybrid-aware food prep saves ₹12,000 daily, totaling ₹4.32L in monthly operational savings</p>
            </div>
          </div>
        </div> */}
      </main>
    </div>
  );
}