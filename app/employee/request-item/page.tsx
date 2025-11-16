'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ThumbsUp, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ItemRequest } from '@/lib/types';

export default function RequestItem() {
  const router = useRouter();
  const { user } = useAuth();
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock vendors list
  const vendors = [
    { id: 'vendor_1', name: 'North Indian Delights' },
    { id: 'vendor_2', name: 'South Indian Express' },
    { id: 'vendor_3', name: 'Grill Master' },
    { id: 'vendor_4', name: 'Happy Bites' },
  ];

  // Mock requests data
  const mockRequests: ItemRequest[] = [
    {
      id: 'req_1',
      requesterId: 'emp_1',
      requesterName: 'Raj Kumar',
      vendorId: 'vendor_1',
      vendorName: 'North Indian Delights',
      itemName: 'Paneer Biryani',
      description: 'Fragrant rice with paneer and spices',
      requestCount: 15,
      timestamp: new Date('2025-11-14'),
      status: 'pending',
      votes: 23,
    },
    {
      id: 'req_2',
      requesterId: 'emp_2',
      requesterName: 'Priya Singh',
      vendorId: 'vendor_2',
      vendorName: 'South Indian Express',
      itemName: 'Chikhalwali Uttapam',
      description: 'Crispy uttapam with vegetables',
      requestCount: 8,
      timestamp: new Date('2025-11-13'),
      status: 'added',
      votes: 18,
    },
    {
      id: 'req_3',
      requesterId: 'emp_3',
      requesterName: 'Amit Sharma',
      vendorId: 'vendor_3',
      vendorName: 'Grill Master',
      itemName: 'Tandoori Fish',
      description: 'Marinated fish grilled with spices',
      requestCount: 12,
      timestamp: new Date('2025-11-12'),
      status: 'pending',
      votes: 31,
    },
    {
      id: 'req_4',
      requesterId: 'emp_4',
      requesterName: 'Sonia Patel',
      vendorId: 'vendor_4',
      vendorName: 'Happy Bites',
      itemName: 'Vegan Pizza',
      description: 'Plant-based pizza with fresh vegetables',
      requestCount: 6,
      timestamp: new Date('2025-11-11'),
      status: 'declined',
      votes: 10,
    },
  ];

  useEffect(() => {
    setRequests(mockRequests);
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName.trim() || !description.trim() || !selectedVendor) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newRequest: ItemRequest = {
        id: `req_${Date.now()}`,
        requesterId: user?.id || 'emp_unknown',
        requesterName: user?.name || 'Anonymous',
        vendorId: selectedVendor,
        vendorName: vendors.find(v => v.id === selectedVendor)?.name || 'Unknown Vendor',
        itemName,
        description,
        requestCount: 1,
        timestamp: new Date(),
        status: 'pending',
        votes: 1,
      };

      setRequests([newRequest, ...requests]);
      setItemName('');
      setDescription('');
      setSelectedVendor('');
      setIsSubmitting(false);

      toast.success('Item request submitted!', {
        description: `Your request for "${itemName}" has been sent to the vendor.`,
      });
    }, 800);
  };

  const handleVote = (requestId: string) => {
    setRequests(
      requests.map(req =>
        req.id === requestId ? { ...req, votes: req.votes + 1, requestCount: req.requestCount + 1 } : req
      )
    );
    toast.success('Vote recorded! 👍');
  };

  const handleDeleteRequest = (requestId: string) => {
    setRequests(requests.filter(req => req.id !== requestId));
    toast.success('Request removed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'added':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/employee/home"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-blue-600">🎁 Request Items</h1>
              <p className="text-sm text-gray-600">Ask vendors for your favorite items</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Request Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Submit a New Request</h2>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Vendor
              </label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose a vendor --</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Peri Peri Fries, Vegan Wrap, etc."
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                placeholder="Describe what you'd like. Include ingredients, spice level, or any special requests..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
            >
              <Send size={20} />
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>

        {/* Popular Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">🔥 Popular Requests</h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {requests.length} requests
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg">
              <p className="text-gray-600">No requests yet. Be the first to request an item! 🚀</p>
            </div>
          ) : (
            requests.map(request => (
              <div
                key={request.id}
                className={`bg-white rounded-lg shadow-md p-4 border-l-4 transition hover:shadow-lg ${
                  request.status === 'added'
                    ? 'border-green-500'
                    : request.status === 'declined'
                    ? 'border-red-500'
                    : 'border-yellow-500'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{request.itemName}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 font-medium">@ {request.vendorName}</p>
                  </div>
                  {request.requesterId === user?.id && (
                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <p className="text-gray-700 text-sm mb-3">{request.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📅 {request.timestamp.toLocaleDateString()}</span>
                    <span>👤 {request.requesterName}</span>
                  </div>
                  <button
                    onClick={() => handleVote(request.id)}
                    className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-200 transition font-semibold"
                  >
                    <ThumbsUp size={16} />
                    {request.votes}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> More votes mean vendors are more likely to add your requested item! Share
            requests with friends to increase votes.
          </p>
        </div>
      </main>
    </div>
  );
}
