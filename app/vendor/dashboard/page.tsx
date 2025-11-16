'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogOut, Clock, Package, TrendingUp, RefreshCw, AlertCircle, Calendar, Check, Camera } from 'lucide-react';
import { toast } from 'sonner';
import MobileMenu from '@/components/MobileMenu';
import QRScanner from '@/components/QRScanner';
import type { Order } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function VendorDashboard() {
  const router = useRouter();
  const { user, logout, orders, updateOrderStatus, refreshOrders, loadVendorOrders } = useAuth();
  const [vendorOrders, setVendorOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner'>('dashboard');
  const [scannedOrderId, setScannedOrderId] = useState('');
  const [completedOrders, setCompletedOrders] = useState<Set<string>>(new Set());
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedOrderForQR, setSelectedOrderForQR] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const mobileMenuLinks = [
    { label: '📋 Menu Manager', href: '/vendor/menu' },
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
          
          // Check if items exist before processing
          if (!dbOrder.items || !Array.isArray(dbOrder.items)) {
            console.log('Skipping order with invalid items:', dbOrder);
            return;
          }
          
          // Transform the database payload to an Order object
          const incomingOrder: Order = {
            orderId: dbOrder.order_id,
            userId: dbOrder.user_id,
            userName: dbOrder.user_name,
            items: dbOrder.items,
            subtotal: dbOrder.total * 0.9,
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
      if (supabase) {
        supabase.removeChannel(channel);
      }
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

  const handleCompleteOrder = async (orderId?: string) => {
    const orderIdToComplete = orderId || scannedOrderId.trim();
    
    if (!orderIdToComplete) {
      toast.error('Please scan or enter order ID');
      return;
    }

    try {
      // Find order in vendor orders
      const order = vendorOrders.find(o => o.orderId === orderIdToComplete.toUpperCase());
      if (!order) {
        toast.error('Order not found or already completed');
        setScannedOrderId('');
        return;
      }

      // Mark as completed
      await updateOrderStatus(orderIdToComplete.toUpperCase(), 'completed');
      
      setCompletedOrders(new Set([...completedOrders, orderIdToComplete.toUpperCase()]));
      setScannedOrderId('');
      
      toast.success('Order completed!', {
        description: `Order ${orderIdToComplete} has been marked as completed`,
      });
    } catch (err) {
      console.error('Error completing order:', err);
      toast.error('Failed to complete order');
    }
  };

  const handleQRScan = (decodedText: string) => {
    // When QR is scanned, directly mark order as ready
    markOrderAsReady(decodedText);
    setShowQRModal(false);
    setSelectedOrderForQR(null);
  };

  const markOrderAsReady = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId.toUpperCase(), 'ready');
      toast.success('Order marked as ready!', {
        description: `Order ${orderId} is now ready for pickup`,
      });
    } catch (err) {
      console.error('Error marking order as ready:', err);
      toast.error('Failed to update order status');
    }
  };

  // Today's orders
  const todayOrders = vendorOrders.filter(order => {
    const orderDate = new Date(order.timestamp).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  });

  // Separate late meal (today) from regular orders
  const lateMealOrders = todayOrders.filter(o => o.reservationType === 'late-meal' && o.status !== 'completed');
  const regularOrders = todayOrders.filter(o => !o.reservationType || (o.reservationType !== 'late-meal' && o.reservationType !== 'pre-order'));
  
  // Get tomorrow's pre-orders (more flexible date matching)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
  const preOrders = vendorOrders.filter(order => {
    // Match pre-orders for tomorrow or any future date (for planning purposes)
    if (order.reservationType !== 'pre-order') return false;
    if (!order.reservationDate) return false;
    
    // Match if it's tomorrow or later (not today, not past)
    const orderDate = new Date(order.reservationDate).toISOString().split('T')[0];
    return orderDate >= tomorrowDateStr;
  });
  
  // Count items to prepare for tomorrow
  const tomorrowItemCount = user?.stall ? preOrders.reduce((sum, order) => {
    const vendorItems = order.items.filter(item => item.vendorId === user.stall);
    return sum + vendorItems.length;
  }, 0) : 0;

  const pendingOrders = todayOrders.filter(o => o.status === 'pending');
  const preparingOrders = todayOrders.filter(o => o.status === 'preparing');
  const readyOrders = todayOrders.filter(o => o.status === 'ready');
  const completedTodayOrders = todayOrders.filter(o => o.status === 'completed');

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
              <p className="text-gray-600 text-sm">Tomorrow Prep</p>
              <Calendar className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-purple-600">{tomorrowItemCount}</p>
            <p className="text-xs text-gray-500 mt-1">Items to prepare</p>
          </div>
        </div>

        {/* Late Meal Reservations - URGENT */}
        {lateMealOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-red-500">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-red-600" size={24} />
              <h2 className="text-2xl font-bold text-red-600">🔴 Late Meal Reservations - URGENT</h2>
              <span className="ml-auto bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                {lateMealOrders.length} orders
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">These orders need to be prepared TODAY. Customers are waiting!</p>
            <div className="space-y-3">
              {lateMealOrders.map(order => (
                <div key={order.orderId} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2 flex-wrap">
                    <div>
                      <p className="font-bold text-gray-800">{order.orderId}</p>
                      <p className="text-sm text-gray-600 font-semibold">Customer: {order.userName}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {order.items.filter(item => item.vendorId === user.stall).map((item, idx) => (
                          <span key={idx} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                            {item.name} ×{item.quantity || 1}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Pickup: {order.reservationTime}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">₹{order.total.toFixed(2)}</p>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                        className="border-2 border-red-300 rounded-lg px-2 py-1 font-semibold mt-2 focus:outline-none focus:ring-2 focus:ring-red-500"
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
          </div>
        )}

        {/* Tomorrow's Pre-Orders */}
        {preOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-purple-600" size={24} />
              <h2 className="text-2xl font-bold text-purple-600">📅 Tomorrow's Pre-Orders (Preparation Plan)</h2>
              <span className="ml-auto bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                {tomorrowItemCount} items
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Plan your preparation for tomorrow. {tomorrowItemCount} items to prepare.</p>
            <div className="space-y-3">
              {preOrders.map(order => {
                const vendorItems = order.items.filter(item => item.vendorId === user.stall);
                return (
                  <div key={order.orderId} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2 flex-wrap">
                      <div>
                        <p className="font-bold text-gray-800">{order.orderId}</p>
                        <p className="text-sm text-gray-600 font-semibold">Customer: {order.userName}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {vendorItems.map((item, idx) => (
                            <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-semibold">
                              {item.name} ×{item.quantity || 1}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Pickup: {order.reservationDate} at {order.reservationTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">₹{order.total.toFixed(2)}</p>
                        <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold mt-2">
                          Pre-Order
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Orders Queue */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Active Orders (Today)</h2>
          </div>

          {regularOrders.filter(o => o.status !== 'completed').length === 0 ? (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No regular orders yet today</p>
              <p className="text-gray-400 text-sm mt-2">Orders will appear here automatically</p>
            </div>
          ) : (
            <div className="space-y-3">
              {regularOrders
                .filter(order => order.status !== 'completed')
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(order => {
                  const vendorItems = order.items.filter(item => item.vendorId === user.stall);
                  return (
                    <div
                      key={order.orderId}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition flex-wrap gap-3"
                    >
                      <div className="flex-1 min-w-fit">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold text-gray-800 font-mono">{order.orderId}</p>
                        </div>
                        <div className="mb-2 flex flex-wrap gap-2">
                          {vendorItems.map((item, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                              {item.name} ×{item.quantity || 1}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          Customer: {order.userName} • {vendorItems.length} item(s)
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-lg font-bold text-gray-800">₹{order.total.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-2 rounded-lg font-semibold text-white text-sm ${getStatusColor(order.status)}`}>
                            {order.status.toUpperCase()}
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            className="border-2 border-gray-300 rounded-lg px-2 py-2 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {getStatusOptions(order.status).map(status => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              setSelectedOrderForQR(order.orderId);
                              setShowQRModal(true);
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition"
                            title="Scan QR to mark as ready"
                          >
                            <Camera size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Fulfillment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Ready Now</p>
              <Check className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-green-600">{readyOrders.length}</p>
            <p className="text-xs text-gray-500 mt-1">Waiting for pickup</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Still Pending</p>
              <Clock className="text-yellow-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {regularOrders.filter(o => o.status === 'pending').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Awaiting prep</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">In Progress</p>
              <RefreshCw className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {regularOrders.filter(o => o.status === 'preparing').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Being prepared</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Completed</p>
              <Package className="text-emerald-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-emerald-600">{completedOrders.size}</p>
            <p className="text-xs text-gray-500 mt-1">Handed over</p>
          </div>
        </div>

        {/* QR Code Scanner Modal */}
        {showQRModal && selectedOrderForQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">📱 Scan QR Code</h2>
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setSelectedOrderForQR(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mb-4">Scanning: <strong>{selectedOrderForQR}</strong></p>
              <QRScanner
                onScan={handleQRScan}
                onError={(error) => toast.error(error)}
              />
              <p className="text-sm text-gray-500 mt-4 text-center">
                Point camera at the QR code to mark this order as ready
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}