'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogOut, Receipt, DollarSign, TrendingUp, Calendar, Download, Filter, Search } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';
import { useEffect, useState } from 'react';
import { BillingTransaction } from '@/lib/types';

export default function AdminBilling() {
  const router = useRouter();
  const { user, logout, getAdminStats, getVendorPerformance, getBillingTransactions } = useAuth();
  const [vendorTransactions, setVendorTransactions] = useState<BillingTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<BillingTransaction[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('all');
  // Default to 'all' so totals show all-time by default instead of today's (which can be empty)
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Mock transaction data - in real app this would come from database
  const mockTransactions = [
    {
      id: 'TXN001',
      orderId: 'ORD-001',
      vendorId: 'vendor_1',
      vendorName: 'North Indian Delights',
      customerName: 'Raj Kumar',
      amount: 350.00,
      commission: 35.00, // 10% commission
      netAmount: 315.00,
      paymentMethod: 'UPI',
      status: 'Completed',
      timestamp: new Date('2025-11-16T12:30:00'),
      items: ['Butter Chicken', 'Naan', 'Rice'],
    },
    {
      id: 'TXN002',
      orderId: 'ORD-002',
      vendorId: 'vendor_2',
      vendorName: 'South Indian Express',
      customerName: 'Priya Singh',
      amount: 180.00,
      commission: 18.00,
      netAmount: 162.00,
      paymentMethod: 'Card',
      status: 'Completed',
      timestamp: new Date('2025-11-16T11:45:00'),
      items: ['Masala Dosa', 'Filter Coffee'],
    },
    {
      id: 'TXN003',
      orderId: 'ORD-003',
      vendorId: 'vendor_3',
      vendorName: 'Grill Master',
      customerName: 'Amit Sharma',
      amount: 450.00,
      commission: 45.00,
      netAmount: 405.00,
      paymentMethod: 'Cash',
      status: 'Pending',
      timestamp: new Date('2025-11-16T13:15:00'),
      items: ['Tandoori Chicken', 'Kebabs'],
    },
    {
      id: 'TXN004',
      orderId: 'ORD-004',
      vendorId: 'vendor_1',
      vendorName: 'North Indian Delights',
      customerName: 'Sonia Patel',
      amount: 280.00,
      commission: 28.00,
      netAmount: 252.00,
      paymentMethod: 'UPI',
      status: 'Completed',
      timestamp: new Date('2025-11-16T14:20:00'),
      items: ['Dal Makhani', 'Paneer Tikka'],
    },
    {
      id: 'TXN005',
      orderId: 'ORD-005',
      vendorId: 'vendor_4',
      vendorName: 'Happy Bites',
      customerName: 'Rohit Kumar',
      amount: 220.00,
      commission: 22.00,
      netAmount: 198.00,
      paymentMethod: 'Card',
      status: 'Completed',
      timestamp: new Date('2025-11-15T19:30:00'),
      items: ['Margherita Pizza'],
    },
  ];

  

  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        let txns: BillingTransaction[] = [];
        if (getBillingTransactions) {
          txns = await getBillingTransactions();
        }

        // If the backend returned nothing, fall back to demo data
        if (!txns || txns.length === 0) {
          txns = mockTransactions;
        }

        setVendorTransactions(txns);
        setFilteredTransactions(txns);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setVendorTransactions(mockTransactions);
        setFilteredTransactions(mockTransactions);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [getBillingTransactions]);

  // Filter transactions based on selected filters
  useEffect(() => {
    let filtered = [...vendorTransactions];

    // Filter by vendor
    if (selectedVendor !== 'all') {
      filtered = filtered.filter(txn => txn.vendorId === selectedVendor);
    }

    // Filter by date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(txn => txn.timestamp >= today);
        break;
      case 'yesterday':
        filtered = filtered.filter(txn => txn.timestamp >= yesterday && txn.timestamp < today);
        break;
      case 'week':
        filtered = filtered.filter(txn => txn.timestamp >= weekAgo);
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(txn => 
        txn.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [vendorTransactions, selectedVendor, dateFilter, searchTerm]);

  const totalRevenue = filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  const totalCommission = filteredTransactions.reduce((sum, txn) => sum + txn.commission, 0);
  const completedTransactions = filteredTransactions.filter(txn => txn.status === 'Completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'UPI': return '📱';
      case 'Card': return '💳';
      case 'Cash': return '💵';
      default: return '💰';
    }
  };

  const vendors = [
    { id: 'vendor_1', name: 'North Indian Delights' },
    { id: 'vendor_2', name: 'South Indian Express' },
    { id: 'vendor_3', name: 'Grill Master' },
    { id: 'vendor_4', name: 'Happy Bites' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu */}
      <MobileMenu
        links={[
          { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
          { href: '/admin/vendors', label: 'Vendors', icon: '🏪' },
          { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
          { href: '/admin/billing', label: 'Billing', icon: '💰' },
            { href: '/admin/hybrid-policies', label: 'Hybrid Policies', icon: '🔄' },
          { href: '/admin/campaigns', label: 'Campaigns', icon: '🎉' }
        ]}
        onLogout={handleLogout}
        user={user}
      />

      {/* Header */}
      <header className="bg-white shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-red-600">💰 Centralized Billing</h1>
            <p className="text-gray-600 text-sm">Monitor all vendor transactions and payments</p>
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
            <Link href="/admin/billing" className="text-red-600 hover:underline font-semibold">
              💰 Billing
            </Link>
            <Link href="/admin/hybrid-policies" className="text-gray-600 hover:underline">
              🔄 Hybrid
            </Link>
            <Link href="/admin/campaigns" className="text-gray-600 hover:underline">
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
        {/* Billing Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  ₹{totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Platform Commission</p>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{totalCommission.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Transactions</p>
                <p className="text-3xl font-bold text-purple-600">
                  {filteredTransactions.length}
                </p>
              </div>
              <Receipt className="text-purple-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Success Rate</p>
                <p className="text-3xl font-bold text-orange-600">
                  {filteredTransactions.length > 0 ? Math.round((completedTransactions / filteredTransactions.length) * 100) : 0}%
                </p>
              </div>
              <Calendar className="text-orange-600" size={32} />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
            <div className="flex gap-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                <Download size={16} className="inline mr-1" /> Export CSV
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                <Receipt size={16} className="inline mr-1" /> Generate Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Vendor Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" /> Vendor
              </label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Vendors</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" /> Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search size={16} className="inline mr-1" /> Search
              </label>
              <input
                type="text"
                placeholder="Search by Order ID, Customer, or Vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Transaction ID</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Order ID</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Vendor</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Customer</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Amount</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Commission</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Net Amount</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Payment</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Time</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      Loading transactions...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      No transactions found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">{transaction.id}</td>
                      <td className="px-4 py-3 font-mono text-sm text-blue-600">{transaction.orderId}</td>
                      <td className="px-4 py-3 font-medium">{transaction.vendorName}</td>
                      <td className="px-4 py-3">{transaction.customerName}</td>
                      <td className="px-4 py-3 font-bold text-green-600">₹{transaction.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-blue-600">₹{transaction.commission.toFixed(2)}</td>
                      <td className="px-4 py-3 font-bold">₹{transaction.netAmount.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1">
                          {getPaymentMethodIcon(transaction.paymentMethod)} {transaction.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {transaction.timestamp.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendor Wise Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Vendor Revenue Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {vendors.map(vendor => {
              const vendorTxns = filteredTransactions.filter(txn => txn.vendorId === vendor.id);
              const vendorRevenue = vendorTxns.reduce((sum, txn) => sum + txn.amount, 0);
              const vendorCommission = vendorTxns.reduce((sum, txn) => sum + txn.commission, 0);
              
              return (
                <div key={vendor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <h3 className="font-bold text-gray-800 mb-3">{vendor.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Orders:</span>
                      <span className="font-medium">{vendorTxns.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-bold text-green-600">₹{vendorRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Commission:</span>
                      <span className="font-medium text-blue-600">₹{vendorCommission.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Net Payout:</span>
                      <span className="font-bold">₹{(vendorRevenue - vendorCommission).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}