'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft, Check, AlertCircle } from 'lucide-react';
import type { Order } from '@/context/AuthContext';

export default function VendorOrders() {
  const router = useRouter();
  const { user, orders, loadVendorOrders } = useAuth();
  const [completedOrdersList, setCompletedOrdersList] = useState<Order[]>([]);

  // Initial load of vendor orders
  useEffect(() => {
    if (user?.stall) {
      loadVendorOrders();
    }
  }, [user?.stall]);

  // Filter completed orders for this vendor
  useEffect(() => {
    if (user?.stall) {
      const vendorOrders = orders.filter(order => 
        order.items.some(item => item.vendorId === user.stall)
      );
      
      const completed = vendorOrders.filter(order => 
        order.status === 'completed'
      );
      
      setCompletedOrdersList(completed);
    }
  }, [orders, user?.stall]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user?.stall) {
        loadVendorOrders();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user?.stall, loadVendorOrders]);

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

        <h1 className="text-3xl font-bold mb-2">✅ Completed Orders</h1>
        <p className="text-gray-600 mb-8">Stall: <span className="font-bold">{user.stall}</span></p>

        {/* Orders Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Completed Orders ({completedOrdersList.length})</h2>
              
              {completedOrdersList.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No completed orders yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedOrdersList.map((order) => (
                        <div
                          key={order.orderId}
                          className="p-4 rounded-lg border-2 bg-green-50 border-green-300"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-mono font-bold text-lg">{order.orderId}</p>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                                  <Check size={14} /> COMPLETED
                                </span>
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
                                Completed: {new Date(order.timestamp).toLocaleTimeString()}
                                {order.reservationDate && order.reservationTime && (
                                  <span className="ml-2">
                                    • Was scheduled for: {order.reservationDate} at {order.reservationTime}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
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
              <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-400">
                <p className="text-gray-600 text-sm">Completed Orders</p>
                <p className="text-3xl font-bold text-emerald-600">{completedOrdersList.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-600">
                  ₹{completedOrdersList.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
