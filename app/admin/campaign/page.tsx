'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogOut, Megaphone, Gift, Target, Calendar, Users, TrendingUp } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';
import { useEffect, useState } from 'react';

export default function AdminCampaigns() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const activeCampaigns = [
    {
      id: 1,
      name: 'Lunch Hour Special',
      type: 'Discount',
      status: 'Active',
      reach: 245,
      conversions: 67,
      budget: 2500,
      spent: 1800,
      endDate: '2025-11-20',
    },
    {
      id: 2,
      name: 'Weekend Feast Deal',
      type: 'Bundle',
      status: 'Active',
      reach: 189,
      conversions: 43,
      budget: 1500,
      spent: 1200,
      endDate: '2025-11-22',
    },
    {
      id: 3,
      name: 'Student Discount',
      type: 'Loyalty',
      status: 'Scheduled',
      reach: 0,
      conversions: 0,
      budget: 1000,
      spent: 0,
      endDate: '2025-11-25',
    },
  ];

  const campaignTemplates = [
    { name: 'Flash Sale', icon: '⚡', description: 'Limited time discount' },
    { name: 'Bundle Deal', icon: '📦', description: 'Combo meal offers' },
    { name: 'Loyalty Program', icon: '⭐', description: 'Points & rewards' },
    { name: 'Referral Bonus', icon: '👥', description: 'Customer referrals' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          { href: '/admin/hybrid-policies', label: 'Hybrid', icon: '🔄' },
          { href: '/admin/campaigns', label: 'Campaigns', icon: '🎉' }
        ]}
        onLogout={handleLogout}
        user={user}
      />

      {/* Header */}
      <header className="bg-white shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-red-600">🎉 Campaign Management</h1>
            <p className="text-gray-600 text-sm">Create and manage marketing campaigns</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-600 hover:underline">
              📊 Dashboard
            </Link>
            <Link href="/admin/vendors" className="text-gray-600 hover:underline">
              🏪 Vendors
            </Link>
            <Link href="/admin/analytics" className="text-gray-600 hover:underline">
              📈 Analytics
            </Link>
            <Link href="/admin/billing" className="text-gray-600 hover:underline">
              💰 Billing
            </Link>
            <Link href="/admin/campaigns" className="text-red-600 hover:underline font-semibold">
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
        {/* Campaign Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Campaigns</p>
                <p className="text-3xl font-bold text-blue-600">
                  {activeCampaigns.filter(c => c.status === 'Active').length}
                </p>
              </div>
              <Megaphone className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Reach</p>
                <p className="text-3xl font-bold text-green-600">
                  {activeCampaigns.reduce((sum, c) => sum + c.reach, 0)}
                </p>
              </div>
              <Users className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Conversion Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round((activeCampaigns.reduce((sum, c) => sum + c.conversions, 0) /
                    activeCampaigns.reduce((sum, c) => sum + c.reach, 0)) * 100)}%
                </p>
              </div>
              <Target className="text-purple-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Budget</p>
                <p className="text-3xl font-bold text-orange-600">
                  ₹{activeCampaigns.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="text-orange-600" size={32} />
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Active Campaigns</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
              ➕ Create Campaign
            </button>
          </div>

          <div className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{campaign.name}</h3>
                    <p className="text-gray-600 text-sm">{campaign.type} Campaign</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Reach</p>
                    <p className="font-bold text-gray-800">{campaign.reach}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Conversions</p>
                    <p className="font-bold text-green-600">{campaign.conversions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-bold text-gray-800">₹{campaign.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Spent</p>
                    <p className="font-bold text-blue-600">₹{campaign.spent.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {Math.round((campaign.spent / campaign.budget) * 100)}% spent
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition">
                      Edit
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">
                      Pause
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Templates */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Campaign Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {campaignTemplates.map((template, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                <div className="text-center mb-3">
                  <span className="text-4xl">{template.icon}</span>
                </div>
                <h3 className="font-bold text-gray-800 text-center mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 text-center mb-4">{template.description}</p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Calendar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Campaign Calendar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-blue-600" size={20} />
                <span className="font-medium text-gray-800">This Week</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Lunch Hour Special (ends Nov 20)</li>
                <li>• Weekend Feast Deal (ends Nov 22)</li>
              </ul>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-green-600" size={20} />
                <span className="font-medium text-gray-800">Next Week</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Student Discount (starts Nov 25)</li>
                <li>• Holiday Special (planned)</li>
              </ul>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="text-purple-600" size={20} />
                <span className="font-medium text-gray-800">Quick Actions</span>
              </div>
              <div className="space-y-2">
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition">
                  Schedule Campaign
                </button>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition">
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
