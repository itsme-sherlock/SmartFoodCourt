"use client";
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar as CalendarIcon, Clock, CheckCircle, Repeat } from 'lucide-react';
import { mockTimeSlots, mockMenuItems, mockVendors } from '@/lib/mockData';
import type { MenuItem } from '@/lib/types'; // Assuming you have a types file

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
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [isReserved, setIsReserved] = useState(false);

  // Reset meal selection when vendor changes
  useEffect(() => {
    setSelectedMeal(null);
  }, [selectedVendorId]);

  const mealsForSelectedVendor = useMemo(() => {
    if (!selectedVendorId) return [];
    return mockMenuItems[selectedVendorId as keyof typeof mockMenuItems] || [];
  }, [selectedVendorId]);

  const handleQuickReserve = (order: typeof mockOrderHistory[0]) => {
    // Pre-fill the form with details from the past order
    const today = new Date().toISOString().split('T')[0];
    setReservationDate(today);
    setSelectedVendorId(order.vendorId);
    // This assumes the first item is the one to be repeated
    setSelectedMeal(order.items[0].id); 
    
    // You might want to automatically select a time or prompt the user
    setReservationTime(mockTimeSlots[0].time);

    // Optional: scroll to the form
    document.getElementById('reservation-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (reservationDate && reservationTime && selectedVendorId && selectedMeal) {
      console.log({
        date: reservationDate,
        time: reservationTime,
        vendorId: selectedVendorId,
        mealId: selectedMeal,
      });
      setIsReserved(true);
    } else {
      alert('Please select a date, time, vendor, and meal.');
    }
  };

  if (isReserved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
          <CheckCircle className="text-green-500 w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reservation Confirmed!</h1>
          <p className="text-gray-600 mb-8">Your late meal has been successfully reserved.</p>
          <button
            onClick={() => router.push('/employee/home')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Late Meal Reservation</h1>
          <p className="text-gray-600 mb-8">Pre-order your meal for a late pickup.</p>

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
          
          <form id="reservation-form" onSubmit={handleReservation} className="space-y-6">
            {/* Date, Time, and Vendor Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="reservation-date" className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="inline-block w-4 h-4 mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  id="reservation-date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="reservation-time" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline-block w-4 h-4 mr-2" />
                  Time
                </label>
                <select
                  id="reservation-time"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
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
                <label htmlFor="vendor-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor
                </label>
                <select
                  id="vendor-select"
                  value={selectedVendorId || ''}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
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

            {/* Meal Selection */}
            {selectedVendorId && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Your Meal</h2>
                {mealsForSelectedVendor.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                    {mealsForSelectedVendor.map(meal => (
                      <div
                        key={meal.id}
                        onClick={() => setSelectedMeal(meal.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedMeal === meal.id
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

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                disabled={!reservationDate || !reservationTime || !selectedVendorId || !selectedMeal}
              >
                Reserve Meal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
