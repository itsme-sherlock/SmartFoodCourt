'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { mockTimeSlots } from '@/lib/mockData';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { CircleMinus } from "lucide-react";


export default function Checkout() {
  const router = useRouter();
  const { cart, clearCart, removeFromCart, user, addOrder } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState('slot_1');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [orderType, setOrderType] = useState<'now' | 'slot'>('now');

  const subtotal = cart.reduce((sum, item) => sum + (item.selectedPrice || 0), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  // Check if cart has reservation items (pre-order or late-meal)
  const hasReservationItems = cart.some(item => item.reservationType === 'pre-order' || item.reservationType === 'late-meal');
  
  // If reservation items exist, force orderType to 'now' since timing is pre-set
  useEffect(() => {
    if (hasReservationItems) {
      setOrderType('now');
    }
  }, [hasReservationItems]);

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!', {
        description: 'Please add items to your cart before placing an order.',
      });
      return;
    }
    
    if (!user) {
      toast.error('Please login first!');
      return;
    }

    const orderId = `ORD${Date.now()}`;
    const timestamp = Date.now();
    
    // Check if this is a reservation order
    const firstItem = cart[0];
    const isReservation = firstItem?.reservationType;
    
    // Create order object
    const order = {
      orderId,
      userId: user.id,
      userName: user.name,
      items: [...cart],
      subtotal,
      tax,
      total,
      paymentMethod,
      orderType,
      selectedSlot: orderType === 'slot' ? selectedSlot : undefined,
      reservationType: isReservation ? firstItem.reservationType : undefined,
      reservationDate: isReservation ? firstItem.reservationDate : undefined,
      reservationTime: isReservation ? firstItem.reservationTime : undefined,
      status: 'pending' as const,
      timestamp,
      date: new Date(timestamp).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Save order to history
    addOrder(order);
    
    const orderTypeText = isReservation 
      ? (firstItem.reservationType === 'pre-order' ? 'Pre-order' : 'Late meal reservation')
      : 'Order';
    
    toast.success(`${orderTypeText} placed successfully!`, {
      description: `Order ID: ${orderId}`,
      duration: 2000,
    });
    clearCart();
    setTimeout(() => {
      router.push(`/employee/order-confirmation?orderId=${orderId}`);
    }, 500);
  };

  const handleRemoveItem = (item: any) => {
    removeFromCart(item.cartId);
    toast.info('Item removed from cart', {
      description: `${item.name} (${item.selectedSize})`,
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ChevronLeft size={20} /> Continue Shopping
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Order</h2>
              {cart.length === 0 ? (
                <p className="text-gray-600">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="border-b pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.vendorName} • Size: {item.selectedSize}</p>
                          {item.reservationType && (
                            <div className="flex gap-2 mt-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                item.reservationType === 'pre-order' 
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                                  : 'bg-orange-100 text-orange-800 border border-orange-300'
                              }`}>
                                {item.reservationType === 'pre-order' ? 'Pre-Order' : 'Late Meal'}
                              </span>
                              <span className="text-xs text-gray-600 self-center">
                                {item.reservationDate} at {item.reservationTime}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold">₹{item.selectedPrice}</span>
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            <CircleMinus size ={20} color="red"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Type */}
            <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${hasReservationItems ? 'opacity-60 pointer-events-none' : ''}`}>
              <h3 className="text-lg font-bold text-gray-800 mb-4">When would you like your order?</h3>
              
              {hasReservationItems && (
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 font-semibold">
                    ℹ️ Reservation items have fixed timing. Order type is set to "Now".
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="orderType"
                    value="now"
                    checked={orderType === 'now'}
                    onChange={(e) => setOrderType(e.target.value as 'now' | 'slot')}
                    disabled={hasReservationItems}
                    className="mr-3"
                  />
                  <span className="font-semibold">Order Now (15 mins)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="orderType"
                    value="slot"
                    checked={orderType === 'slot'}
                    onChange={(e) => setOrderType(e.target.value as 'now' | 'slot')}
                    disabled={hasReservationItems}
                    className="mr-3"
                  />
                  <span className="font-semibold">Choose a Time Slot</span>
                </label>
              </div>

              {orderType === 'slot' && !hasReservationItems && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {mockTimeSlots.map(slot => (
                    <button
                      key={slot.slotId}
                      onClick={() => setSelectedSlot(slot.slotId)}
                      className={`p-3 rounded-lg border-2 text-left ${
                        selectedSlot === slot.slotId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <p className="font-bold">{slot.time}</p>
                      <p className="text-xs text-gray-600">{slot.capacity - slot.currentOrders} slots left</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Method</h3>
              <div className="space-y-3">
                {['upi', 'card', 'wallet', 'loyalty'].map(method => (
                  <label key={method} className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className="capitalize font-semibold">
                      {method === 'upi' && '📱 UPI'}
                      {method === 'card' && '💳 Credit/Debit Card'}
                      {method === 'wallet' && '📲 Mobile Wallet'}
                      {method === 'loyalty' && '⭐ Loyalty Points'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3 text-gray-700 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%):</span>
                  <span className="font-semibold">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-blue-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
              >
                Place Order
              </button>

              <p className="text-center text-gray-600 text-sm mt-4">
                💳 Payment will be processed securely
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
