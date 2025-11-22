"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Package, Clock, CheckCircle, XCircle, Repeat, Calendar, Download, X, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/lib/types';
import { QRCodeSVG } from 'qrcode.react';

export default function OrderHistory() {
  const router = useRouter();
  const { getOrderHistory, repeatOrder, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [readyNotifications, setReadyNotifications] = useState<Set<string>>(new Set());
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());
  const [selectedQROrder, setSelectedQROrder] = useState<string | null>(null);

  useEffect(() => {
    const initialOrders = getOrderHistory();
    setOrders(initialOrders);
  }, [getOrderHistory]);

  useEffect(() => {
    if (!user?.id || !supabase) return;

    const channel = supabase
      .channel(`realtime-orders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const dbOrder = payload.new as any;
          const updatedOrder: Order = {
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
          
          // Check if order status changed to "ready"
          setOrders((currentOrders) => {
            const oldOrder = currentOrders.find(o => o.orderId === updatedOrder.orderId);
            if (oldOrder && oldOrder.status !== 'ready' && updatedOrder.status === 'ready') {
              // New ready notification!
              setReadyNotifications((prev) => new Set([...prev, updatedOrder.orderId]));
            }
            return currentOrders.map((order) =>
              order.orderId === updatedOrder.orderId ? updatedOrder : order
            );
          });
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id]);

  // Keep UI responsive with Tailwind classes; avoid JS matchMedia and extra state.

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'preparing':
        return <Package size={16} />;
      case 'ready':
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const handleRepeatOrder = (orderId: string) => {
    repeatOrder(orderId);
    router.push('/employee/checkout');
  };

  const handleDownloadQR = (orderId: string) => {
    const svg = document.getElementById(`qr-code-${orderId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `order-${orderId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* QR Code Modal — shown only on large screens (via Tailwind `hidden lg:flex`) */}
      {selectedQROrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-auto text-center">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Order QR Code</h2>
              <button
                onClick={() => setSelectedQROrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Order ID: <span className="font-bold text-blue-600">{selectedQROrder}</span>
            </p>

            <div className="bg-white p-4 rounded-lg inline-block shadow-sm border border-gray-200 mb-6">
              <QRCodeSVG
                id={`qr-code-${selectedQROrder}`}
                value={selectedQROrder}
                size={200}
                className="w-full h-auto max-w-60 mx-auto"
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="text-xs text-gray-600 mb-4">
              📸 Show this QR code to the vendor when picking up your order
            </p>

            <button
              onClick={() => handleDownloadQR(selectedQROrder)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              <Download size={18} />
              Download QR Code
            </button>

            <button
              onClick={() => setSelectedQROrder(null)}
              className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Ready Notifications */}
        {Array.from(readyNotifications).map((orderId) => {
          if (dismissedNotifications.has(orderId)) return null;
          const order = orders.find(o => o.orderId === orderId);
          if (!order) return null;
          
          return (
            <div
              key={orderId}
              className="bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-lg p-4 mb-6 flex justify-between items-start gap-4 shadow-lg"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="text-4xl animate-bounce">✅</div>
                <div>
                  <h3 className="text-xl font-bold text-green-800">Order {orderId} is READY!</h3>
                  <p className="text-green-700 font-semibold mt-1">
                    Your food is prepared and ready for pickup! 🎉
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    {order.items.length} items • Total: ₹{order.total.toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDismissedNotifications((prev) => new Set([...prev, orderId]))}
                className="text-green-600 hover:text-green-800 text-2xl shrink-0"
              >
                ✕
              </button>
            </div>
          );
        })}
        
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ChevronLeft size={20} /> Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Order History</h1>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg">No orders yet</p>
              <p className="text-gray-500 text-sm mt-2">Start ordering to see your history here</p>
              <button
                onClick={() => router.push('/employee/home')}
                className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Browse Vendors
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-mono text-sm text-gray-600">
                        Order ID: <span className="font-bold text-blue-600">{order.orderId}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{order.date}</p>
                      {order.reservationType && (
                        <div className="flex gap-2 mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${order.reservationType === 'pre-order'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : 'bg-orange-100 text-orange-800 border border-orange-300'
                            }`}>
                            <Calendar size={12} />
                            {order.reservationType === 'pre-order' ? 'Pre-Order' : 'Late Meal'}
                          </span>
                          {order.reservationDate && order.reservationTime && (
                            <span className="text-xs text-gray-600">
                              {order.reservationDate} at {order.reservationTime}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.name} ({item.selectedSize}) - {item.vendorName}
                          </span>
                          <span className="font-semibold text-gray-800">₹{item.selectedPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                    <div className="border-t pt-3 flex justify-between items-center">
                    <div className="text-sm text-gray-600 flex flex-col sm:flex-row">
                      <span className="capitalize">{order.paymentMethod}</span>

                      {order.orderType === "slot" && order.selectedSlot && (
                        <>
                          {/* Mobile version */}
                          <span className="ml-0 sm:hidden">{order.selectedSlot}</span>

                          {/* Desktop version */}
                          <span className="ml-2 hidden sm:inline">• Slot: {order.selectedSlot}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelectedQROrder((prev) => (prev === order.orderId ? null : order.orderId))}
                        className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-semibold text-[10px] sm:text-sm transition"
                        title="View QR Code"
                      >
                        <QrCode size={16} /> <span className="hidden sm:inline">View QR</span>
                      </button>
                      <button
                        onClick={() => handleRepeatOrder(order.orderId)}
                        className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-semibold text-[10px] sm:text-sm transition"
                      >
                        <Repeat size={16} /> <span className="hidden sm:inline">Repeat order</span>
                      </button>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-lg font-bold text-blue-600">₹{order.total.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* QR modal will be used for both mobile and desktop. */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}