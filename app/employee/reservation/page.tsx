"use client";
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar as CalendarIcon, Clock, Repeat } from 'lucide-react';
import { mockTimeSlots, mockMenuItems, mockVendors } from '@/lib/mockData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Mock order history for the logged-in employee
const mockOrderHistory = [
  {
    orderId: 'ord_hist_1',
    date: '2023-10-26T12:30:00Z',
    vendorId: 'vendor_1',
    vendorName: 'North Indian Delights',
    items: [
      { ...mockMenuItems.vendor_1[0], quantity: 1 }, // Butter Chicken
    ],
    total: 250,
  },
  {
    orderId: 'ord_hist_2',
    date: '2023-10-24T13:00:00Z',
    vendorId: 'vendor_2',
    vendorName: 'South Indian Express',
    items: [
      { ...mockMenuItems.vendor_2[0], quantity: 1 }, // Masala Dosa
    ],
    total: 120,
  },
];

export default function ReservationPage() {
  const router = useRouter();
  const { addToCart, clearCart } = useAuth();
  const [activeTab, setActiveTab] = useState('late-meal');
  
  // Late Meal Reservation State
  const [lateMealDate, setLateMealDate] = useState('');
  const [lateMealTime, setLateMealTime] = useState('');
  const [lateMealVendorId, setLateMealVendorId] = useState<string | null>(null);
  const [lateMealSelectedMeal, setLateMealSelectedMeal] = useState<string | null>(null);
  
  // Pre-Order State
  const [preOrderDate, setPreOrderDate] = useState('');
  const [preOrderTime, setPreOrderTime] = useState('');
  const [preOrderVendorId, setPreOrderVendorId] = useState<string | null>(null);
  const [preOrderSelectedMeal, setPreOrderSelectedMeal] = useState<string | null>(null);

  // Reset meal selection when vendor changes for late meal
  useEffect(() => {
    setLateMealSelectedMeal(null);
  }, [lateMealVendorId]);

  // Reset meal selection when vendor changes for pre-order
  useEffect(() => {
    setPreOrderSelectedMeal(null);
  }, [preOrderVendorId]);

  // Get today's date for late meal (default to today)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setLateMealDate(today);
  }, []);

  // Get tomorrow's date for pre-order (default to tomorrow)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPreOrderDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const lateMealMenuItems = useMemo(() => {
    if (!lateMealVendorId) return [];
    return mockMenuItems[lateMealVendorId as keyof typeof mockMenuItems] || [];
  }, [lateMealVendorId]);

  const preOrderMenuItems = useMemo(() => {
    if (!preOrderVendorId) return [];
    return mockMenuItems[preOrderVendorId as keyof typeof mockMenuItems] || [];
  }, [preOrderVendorId]);

  const handleQuickReserve = (order: typeof mockOrderHistory[0]) => {
    const today = new Date().toISOString().split('T')[0];
    setLateMealDate(today);
    setLateMealVendorId(order.vendorId);
    setLateMealSelectedMeal(order.items[0].id);
    setLateMealTime(mockTimeSlots[0].time);
    setActiveTab('late-meal');
    
    setTimeout(() => {
      document.getElementById('late-meal-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLateMealReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (lateMealDate && lateMealTime && lateMealVendorId && lateMealSelectedMeal) {
      const selectedMeal = lateMealMenuItems.find(meal => meal.id === lateMealSelectedMeal);
      const selectedVendor = mockVendors.find(v => v.id === lateMealVendorId);
      
      if (selectedMeal && selectedVendor) {
        // Clear cart and add the reservation item
        clearCart();
        
        const cartItem = {
          ...selectedMeal,
          vendorId: lateMealVendorId,
          vendorName: selectedVendor.name,
          selectedSize: 'Regular',
          selectedPrice: selectedMeal.basePrice,
          reservationType: 'late-meal' as const,
          reservationDate: lateMealDate,
          reservationTime: lateMealTime,
        };
        
        addToCart(cartItem);
        
        toast.success('Late meal added to cart!', {
          description: `${selectedMeal.name} for ${lateMealDate} at ${lateMealTime}`,
        });
        
        // Navigate to checkout
        router.push('/employee/checkout');
      }
    } else {
      toast.error('Please select a time, vendor, and meal.');
    }
  };

  const handlePreOrderReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (preOrderDate && preOrderTime && preOrderVendorId && preOrderSelectedMeal) {
      const selectedMeal = preOrderMenuItems.find(meal => meal.id === preOrderSelectedMeal);
      const selectedVendor = mockVendors.find(v => v.id === preOrderVendorId);
      
      if (selectedMeal && selectedVendor) {
        // Clear cart and add the reservation item
        clearCart();
        
        const cartItem = {
          ...selectedMeal,
          vendorId: preOrderVendorId,
          vendorName: selectedVendor.name,
          selectedSize: 'Regular',
          selectedPrice: selectedMeal.basePrice,
          reservationType: 'pre-order' as const,
          reservationDate: preOrderDate,
          reservationTime: preOrderTime,
        };
        
        addToCart(cartItem);
        
        toast.success('Pre-order added to cart!', {
          description: `${selectedMeal.name} for ${preOrderDate} at ${preOrderTime}`,
        });
        
        // Navigate to checkout
        router.push('/employee/checkout');
      }
    } else {
      toast.error('Please select a date, time, vendor, and meal.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Meal Reservation</h1>
          <p className="text-gray-600 mb-6">Reserve your meal for later today or pre-order for tomorrow.</p>

          {/* Tabs for Late Meal and Pre-Order */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="late-meal" className="text:xs sm:text-base">
                Late Meal
              </TabsTrigger>
              <TabsTrigger value="pre-order" className="text:xs sm:text-base">
                Pre-Order
              </TabsTrigger>
            </TabsList>

            {/* Late Meal Reservation Tab */}
            <TabsContent value="late-meal">
              {/* Smart Recommendation */}
              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💡</span>
                    <p className="text-sm text-yellow-800">
                      <strong>Smart Tip:</strong> Based on hybrid patterns, North Indian Delights will have 
                      fresh Butter Chicken at 1:00 PM tomorrow (low crowd expected)
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Repeat Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">One-Tap Repeat</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockOrderHistory.slice(0, 2).map(order => (
                    <div key={order.orderId} className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{order.items.map(i => i.name).join(', ')}</p>
                        <p className="text-sm text-gray-600">from {order.vendorName}</p>
                      </div>
                      <button
                        onClick={() => handleQuickReserve(order)}
                        className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                        title={`Repeat order for ${order.items.map(i => i.name).join(', ')}`}
                      >
                        <Repeat size={16} /> Repeat
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <form id="late-meal-form" onSubmit={handleLateMealReservation} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="late-meal-date" className="block text-sm font-medium text-gray-700 mb-2">
                      <CalendarIcon className="inline-block w-4 h-4 mr-2" />
                      Date (Today)
                    </label>
                    <input
                      type="date"
                      id="late-meal-date"
                      value={lateMealDate}
                      onChange={(e) => setLateMealDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="late-meal-time" className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline-block w-4 h-4 mr-2" />
                      Time
                    </label>
                    <select
                      id="late-meal-time"
                      value={lateMealTime}
                      onChange={(e) => setLateMealTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="" disabled>Select a time</option>
                      {mockTimeSlots.map(slot => (
                        <option key={slot.slotId} value={slot.time}>
                          {slot.time} ({slot.capacity - slot.currentOrders} left)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="late-meal-vendor" className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor
                    </label>
                    <select
                      id="late-meal-vendor"
                      value={lateMealVendorId || ''}
                      onChange={(e) => setLateMealVendorId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="" disabled>Select a vendor</option>
                      {mockVendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {lateMealVendorId && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Your Meal</h2>
                    {lateMealMenuItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                        {lateMealMenuItems.map(meal => (
                          <div
                            key={meal.id}
                            onClick={() => setLateMealSelectedMeal(meal.id)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              lateMealSelectedMeal === meal.id
                                ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500'
                                : 'bg-white hover:border-gray-400'
                            }`}
                          >
                            <h3 className="font-bold text-gray-900">{meal.name}</h3>
                            <p className="text-sm text-gray-600">{meal.description}</p>
                            <p className="text-sm font-semibold text-gray-800 mt-2">₹{meal.basePrice}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">No meals available for this vendor.</p>
                    )}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    disabled={!lateMealDate || !lateMealTime || !lateMealVendorId || !lateMealSelectedMeal}
                  >
                    Reserve Late Meal
                  </button>
                </div>
              </form>
            </TabsContent>

            {/* Pre-Order Tab */}
            <TabsContent value="pre-order">
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Pre-Order:</strong> Reserve your meal for tomorrow. Orders must be placed before 8 PM today.
                  </p>
                </div>
              </div>

              <form id="pre-order-form" onSubmit={handlePreOrderReservation} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="pre-order-date" className="block text-sm font-medium text-gray-700 mb-2">
                      <CalendarIcon className="inline-block w-4 h-4 mr-2" />
                      Date (Tomorrow)
                    </label>
                    <input
                      type="date"
                      id="pre-order-date"
                      value={preOrderDate}
                      onChange={(e) => setPreOrderDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="pre-order-time" className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline-block w-4 h-4 mr-2" />
                      Time
                    </label>
                    <select
                      id="pre-order-time"
                      value={preOrderTime}
                      onChange={(e) => setPreOrderTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="" disabled>Select a time</option>
                      {mockTimeSlots.map(slot => (
                        <option key={slot.slotId} value={slot.time}>
                          {slot.time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pre-order-vendor" className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor
                    </label>
                    <select
                      id="pre-order-vendor"
                      value={preOrderVendorId || ''}
                      onChange={(e) => setPreOrderVendorId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="" disabled>Select a vendor</option>
                      {mockVendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {preOrderVendorId && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Your Meal</h2>
                    {preOrderMenuItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                        {preOrderMenuItems.map(meal => (
                          <div
                            key={meal.id}
                            onClick={() => setPreOrderSelectedMeal(meal.id)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              preOrderSelectedMeal === meal.id
                                ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500'
                                : 'bg-white hover:border-gray-400'
                            }`}
                          >
                            <h3 className="font-bold text-gray-900">{meal.name}</h3>
                            <p className="text-sm text-gray-600">{meal.description}</p>
                            <p className="text-sm font-semibold text-gray-800 mt-2">₹{meal.basePrice}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">No meals available for this vendor.</p>
                    )}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    disabled={!preOrderDate || !preOrderTime || !preOrderVendorId || !preOrderSelectedMeal}
                  >
                    Confirm Pre-Order
                  </button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}