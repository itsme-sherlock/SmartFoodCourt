'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogOut, Clock, Package, TrendingUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import MobileMenu from '@/components/MobileMenu';
import type { Order } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function VendorDashboard() {
  const router = useRouter();
  const { user, logout, orders, updateOrderStatus, refreshOrders, loadVendorOrders } = useAuth();
  const [vendorOrders, setVendorOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const mobileMenuLinks = [
    { label: '📋 Menu Manager', href: '/vendor/menu' },
    { label: '📦 Orders & QR Scanner', href: '/vendor/orders' },
  ];

  // Initial load of vendor orders
  useEffect(() => {
    if (user?.stall) {
      loadVendorOrders();
    }
  }, [user?.stall]);

  // Filter orders for this vendor
  useEffect(() => {
    if (user?.stall) {
      const filtered = orders.filter(order => 
        order.items.some(item => item.vendorId === user.stall)
      );
      setVendorOrders(filtered);
    }
  }, [orders, user?.stall]);

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!user?.stall || !supabase) return;

    const channel = supabase
      .channel(`vendor-orders-${user.stall}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Vendor received update:', payload);
          const dbOrder = payload.new as any;
          
          // Transform the database payload to an Order object
          const incomingOrder: Order = {
            orderId: dbOrder.order_id,
            userId: dbOrder.user_id,
            userName: dbOrder.user_name,
            items: dbOrder.items,
            subtotal: dbOrder.total * 0.9, // Assuming tax is 10%
            tax: dbOrder.total * 0.1,
            total: dbOrder.total,
            paymentMethod: dbOrder.payment_method,
            orderType: 'now' as const,
            reservationType: dbOrder.reservation_type,
            reservationDate: dbOrder.reservation_date,
            reservationTime: dbOrder.reservation_time,
            status: dbOrder.status as Order['status'],
            timestamp: new Date(dbOrder.created_at).getTime(),
            date: new Date(dbOrder.created_at).toLocaleDateString(),
          };

          // Check if the order belongs to this vendor
          const isRelevant = incomingOrder.items.some(item => item.vendorId === user.stall);
          if (!isRelevant) {
            return;
          }

          if (payload.eventType === 'INSERT') {
            setVendorOrders((currentOrders) => [incomingOrder, ...currentOrders]);
          } else if (payload.eventType === 'UPDATE') {
            setVendorOrders((currentOrders) =>
              currentOrders.map((order) =>
                order.orderId === incomingOrder.orderId ? incomingOrder : order
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.stall, supabase]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus as 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled');
      toast.success(`Order ${orderId} marked as ${newStatus}`, {
        description: `Status updated successfully`,
      });
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const todayOrders = vendorOrders.filter(order => {
    const orderDate = new Date(order.timestamp).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  });

  const pendingOrders = todayOrders.filter(o => o.status === 'pending');
  const preparingOrders = todayOrders.filter(o => o.status === 'preparing');
  const readyOrders = todayOrders.filter(o => o.status === 'ready');
  const completedOrders = todayOrders.filter(o => o.status === 'completed');

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusOptions = (currentStatus: string) => {
    const statusFlow = ['pending', 'preparing', 'ready', 'completed'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return statusFlow.slice(currentIndex);
  };

  if (!user?.stall) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Please login as a vendor</p>
          <button
            onClick={() => router.push('/auth/vendor-login')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* MOBILE MENU COMPONENT */}
      <MobileMenu 
        userName={user?.name || 'Vendor'} 
        menuLinks={mobileMenuLinks} 
        onLogout={handleLogout}
      />

      {/* DESKTOP HEADER */}
      <header className="bg-white shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-600">🏪 Vendor Dashboard</h1>
            <p className="text-gray-600 text-sm">Welcome, {user?.name} • Stall: {user?.stall}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/vendor/menu" className="text-green-600 hover:underline">
              📋 Menu Manager
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
        {/* Hybrid Policy Optimization Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-blue-800">Tomorrow's Smart Prep Recommendation</h3>
              <p className="text-sm text-blue-700">
                Prepare <strong>40% less food</strong> • Expected: 25 employees (vs usual 60) • 
                <span className="font-semibold text-green-600">Save ₹3,200</span>
              </p>
            </div>
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold ml-auto">AI POWERED</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Today's Orders</p>
              <Package className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-green-600">{todayOrders.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              {pendingOrders.length} pending • {preparingOrders.length} preparing
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Revenue</p>
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-blue-600">₹{todayRevenue.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">Today's total</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Ready for Pickup</p>
              <Clock className="text-yellow-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{readyOrders.length}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting collection</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Completed</p>
              <RefreshCw className={`text-purple-600 ${isRefreshing ? 'animate-spin' : ''}`} size={24} />
            </div>
            <p className="text-3xl font-bold text-purple-600">{completedOrders.length}</p>
            <p className="text-xs text-gray-500 mt-1">Auto-refresh: ON</p>
          </div>
        </div>

        {/* Active Orders Queue */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Active Orders</h2>
            <Link
              href="/vendor/orders"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              📱 Open QR Scanner
            </Link>
          </div>

          {todayOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No orders yet today</p>
              <p className="text-gray-400 text-sm mt-2">Orders will appear here automatically</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayOrders
                .filter(order => order.status !== 'completed')
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(order => (
                  <div
                    key={order.orderId}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition flex-wrap"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-bold text-gray-800 font-mono">{order.orderId}</p>
                        {order.reservationType && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            order.reservationType === 'pre-order' 
                              ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                              : 'bg-orange-100 text-orange-800 border border-orange-300'
                          }`}>
                            {order.reservationType === 'pre-order' ? 'Pre-Order' : 'Late Meal'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Customer: {order.userName} • {order.items.length} items
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.timestamp).toLocaleTimeString()}
                        {order.reservationDate && order.reservationTime && (
                          <span className="ml-2">
                            • Pickup: {order.reservationDate} at {order.reservationTime}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="text-right mr-4">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-lg font-bold text-gray-800">₹{order.total.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs sm:text-sm">
                        <span className={`px-4 py-2 rounded-lg font-semibold text-white ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                          className="border-2 border-gray-300 rounded-lg px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {getStatusOptions(order.status).map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}