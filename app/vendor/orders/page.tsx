'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase, hasSupabase } from '@/lib/supabase';
import { ChevronLeft, Check, AlertCircle, Camera } from 'lucide-react';
import { toast } from 'sonner';
import QRScanner from '@/components/QRScanner';
import type { Order } from '@/context/AuthContext';

export default function VendorOrders() {
  const router = useRouter();
  const { user, markOrderReady, orders, updateOrderStatus, refreshOrders, loadVendorOrders } = useAuth();
  const [scannedOrderId, setScannedOrderId] = useState('');
  const [vendorOrders, setVendorOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Set<string>>(new Set());
  const [showScanner, setShowScanner] = useState(false);

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
        order.items.some(item => item.vendorId === user.stall) &&
        order.status !== 'completed' &&
        order.status !== 'cancelled'
      );
      setVendorOrders(filtered);
    }
  }, [orders, user?.stall]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshOrders]);

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
      setShowScanner(false);
      
      toast.success('Order completed!', {
        description: `Order ${orderIdToComplete} has been marked as completed`,
      });
    } catch (err) {
      console.error('Error completing order:', err);
      toast.error('Failed to complete order');
    }
  };

  const handleQRScan = (decodedText: string) => {
    setScannedOrderId(decodedText);
    handleCompleteOrder(decodedText);
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

        {/* QR Scanner */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">🔍 QR Code Scanner</h2>
          
          {/* Manual Input */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Scan QR code or paste Order ID..."
              value={scannedOrderId}
              onChange={(e) => setScannedOrderId(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleCompleteOrder()}
              className="flex-1 border-2 border-green-500 rounded-lg px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <button
              onClick={() => handleCompleteOrder()}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition whitespace-nowrap"
            >
              ✅ Complete Order
            </button>
          </div>

          {/* Camera Scanner */}
          <div className="border-t pt-4">
            <QRScanner
              onScan={handleQRScan}
              onError={(error) => toast.error(error)}
            />
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            📱 Tip: Use camera scanner or manually enter the Order ID above
          </p>
        </div>

        {/* Pending Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">⏳ Active Orders ({vendorOrders.length})</h2>
              
              {vendorOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">✨ All caught up! No pending orders.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vendorOrders.map((order) => (
                    <div
                      key={order.orderId}
                      className={`p-4 rounded-lg border-2 transition cursor-pointer hover:shadow-md ${
                        completedOrders.has(order.orderId)
                          ? 'bg-green-100 border-green-500'
                          : order.status === 'ready'
                          ? 'bg-green-50 border-green-300'
                          : order.status === 'preparing'
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-yellow-50 border-yellow-300 hover:border-yellow-400'
                      }`}
                      onClick={() => setScannedOrderId(order.orderId)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-mono font-bold text-lg">{order.orderId}</p>
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
                          <p className="text-sm text-gray-600">Customer: {order.userName}</p>
                          <p className="text-sm mt-1">Items: {order.items.length}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.timestamp).toLocaleTimeString()}
                            {order.reservationDate && order.reservationTime && (
                              <span className="ml-2">
                                • Pickup: {order.reservationDate} at {order.reservationTime}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                          <p className={`font-bold mt-2 uppercase text-sm ${
                            order.status === 'ready' ? 'text-green-600' :
                            order.status === 'preparing' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`}>
                            {order.status === 'ready' && <span className="flex items-center gap-1"><Check size={16} /> READY</span>}
                            {order.status === 'preparing' && '🔄 PREPARING'}
                            {order.status === 'pending' && '⏳ PENDING'}
                          </p>
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
                <p className="text-3xl font-bold text-yellow-600">
                  {vendorOrders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-gray-600 text-sm">Preparing</p>
                <p className="text-3xl font-bold text-blue-600">
                  {vendorOrders.filter(o => o.status === 'preparing').length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedOrders.size}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-600">
                  ₹{vendorOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
