'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VendorOrderItem {
  order_id: string;
  vendor_id: string;
  status: string;
  created_at: string;
  orders?: {
    user_name: string;
    items: any[];
    total: number;
  };
}

export default function VendorOrders() {
  const router = useRouter();
  const { user, markOrderReady } = useAuth();
  const [scannedOrderId, setScannedOrderId] = useState('');
  const [pendingOrders, setPendingOrders] = useState<VendorOrderItem[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load pending orders for this vendor
  useEffect(() => {
    if (user?.stall) {
      loadPendingOrders();
      // Refresh every 5 seconds
      const interval = setInterval(loadPendingOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.stall]);

  const loadPendingOrders = async () => {
    if (!user?.stall) return;
    try {
      const { data, error } = await supabase
        .from('vendor_orders')
        .select(`
          order_id,
          vendor_id,
          status,
          created_at,
          orders:order_id(
            user_name,
            items,
            total
          )
        `)
        .eq('vendor_id', user.stall)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPendingOrders(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading orders:', err);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!scannedOrderId.trim()) {
      toast.error('Please scan or enter order ID');
      return;
    }

    try {
      // Find order in pending list
      const order = pendingOrders.find(o => o.order_id === scannedOrderId.toUpperCase());
      if (!order) {
        toast.error('Order not found or already completed');
        setScannedOrderId('');
        return;
      }

      // Mark as ready
      await markOrderReady(scannedOrderId.toUpperCase());
      
      setCompletedOrders(new Set([...completedOrders, scannedOrderId.toUpperCase()]));
      setScannedOrderId('');
      
      // Reload orders
      await loadPendingOrders();
    } catch (err) {
      console.error('Error completing order:', err);
      toast.error('Failed to complete order');
    }
  };

  if (!user?.stall) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Not logged in as vendor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/vendor/dashboard')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-semibold"
        >
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-2">📦 Order Management & QR Scanner</h1>
        <p className="text-gray-600 mb-8">Stall: <span className="font-bold">{user.stall}</span></p>

        {/* QR Scanner Input */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">🔍 Scan QR Code</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Scan QR code here or paste Order ID..."
              value={scannedOrderId}
              onChange={(e) => setScannedOrderId(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleCompleteOrder()}
              autoFocus
              className="flex-1 border-2 border-green-500 rounded-lg px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <button
              onClick={handleCompleteOrder}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition whitespace-nowrap"
            >
              ✅ Mark Ready
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">📱 Tip: Place your phone's camera near the QR code or paste the Order ID manually</p>
        </div>

        {/* Pending Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">⏳ Pending Orders ({pendingOrders.length})</h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading orders...</p>
                </div>
              ) : pendingOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">✨ All caught up! No pending orders.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <div
                      key={order.order_id}
                      className={`p-4 rounded-lg border-2 transition cursor-pointer hover:shadow-md ${
                        completedOrders.has(order.order_id)
                          ? 'bg-green-100 border-green-500'
                          : 'bg-yellow-50 border-yellow-300 hover:border-yellow-400'
                      }`}
                      onClick={() => setScannedOrderId(order.order_id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-mono font-bold text-lg">{order.order_id}</p>
                          <p className="text-sm text-gray-600">Customer: {order.orders?.user_name}</p>
                          <p className="text-sm mt-2">Items: {order.orders?.items?.length || 0}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{order.orders?.total}</p>
                          {completedOrders.has(order.order_id) ? (
                            <div className="flex items-center gap-1 text-green-600 font-bold mt-2">
                              <Check size={18} /> READY
                            </div>
                          ) : (
                            <p className="text-yellow-600 font-bold mt-2">⏳ PENDING</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
            <h3 className="text-xl font-bold mb-4">📊 Today's Stats</h3>
            <div className="space-y-3">
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingOrders.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedOrders.size}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{pendingOrders.reduce((sum, o) => sum + (o.orders?.total || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
