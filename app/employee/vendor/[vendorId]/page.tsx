"use client";
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { mockVendors, mockMenuItems } from '@/lib/mockData';
import { ShoppingCart, ChevronLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorMenu() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params?.vendorId as string | undefined;
  const { addToCart, cart } = useAuth();
  const vendor = vendorId ? mockVendors.find(v => v.id === vendorId) : undefined;
  const items = vendorId ? mockMenuItems[vendorId as keyof typeof mockMenuItems] || [] : [];
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  if (!vendor) return <div>Vendor not found</div>;

  const unexploredItems = items.filter(item => item.orderCount < 10);
  const getPrice = (item: any, size: string) => item.sizes[size as keyof typeof item.sizes] || item.basePrice;

  const handleAddToCart = (item: any) => {
    const quantity = quantities[item.id] || 1;
    const size = selectedSizes[item.id] || 'medium';
    const price = getPrice(item, size);

    for (let i = 0; i < quantity; i++) {
      addToCart({
        ...item,
        selectedSize: size,
        selectedPrice: price,
        vendorId: vendor.id,
        vendorName: vendor.name,
      });
    }
    
    toast.success(`Added ${quantity} ${item.name} (${size}) to cart!`, {
      description: `₹${price * quantity} • ${vendor.name}`,
      duration: 3000,
    });
    
    setQuantities({ ...quantities, [item.id]: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ChevronLeft size={20} /> Back
          </button>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl mb-2">{vendor.logo}</div>
              <h1 className="text-3xl font-bold text-gray-800">{vendor.name}</h1>
              <div className="flex gap-4 mt-2 text-gray-600">
                <span>⭐ {vendor.rating}</span>
                <span>🕐 {vendor.operatingHours}</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/employee/checkout')}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              <ShoppingCart size={20} /> Cart ({cart.length})
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Explore Unexplored */}
        {unexploredItems.length > 0 && (
          <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 mt-1 shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-yellow-800 mb-2">🔍 Explore Unexplored</h3>
                <p className="text-yellow-700 text-sm mb-3">
                  These dishes are rarely ordered. Try them now!
                </p>
                <div className="flex gap-2 flex-wrap">
                  {unexploredItems.map(item => (
                    <span key={item.id} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                  item.status === 'Ready' ? 'bg-green-500' :
                  item.status === 'Preparing' ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`}>
                  {item.status}
                </div>
              </div>

              {item.allergens.length > 0 && (
                <div className="mb-3 text-xs text-red-600">
                  ⚠️ Allergens: {item.allergens.join(', ')}
                </div>
              )}

              {/* Size Selection */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Size:</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSizes({ ...selectedSizes, [item.id]: size })}
                      className={`px-3 py-1 rounded border-2 ${
                        (selectedSizes[item.id] || 'medium') === size
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <span className="capitalize text-sm font-semibold">{size}</span>
                      <div className="text-xs text-gray-600">₹{getPrice(item, size)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantities({ ...quantities, [item.id]: Math.max(0, (quantities[item.id] || 1) - 1) })}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantities[item.id] || 1}</span>
                  <button
                    onClick={() => setQuantities({ ...quantities, [item.id]: (quantities[item.id] || 1) + 1 })}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={item.status === 'Sold Out'}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
