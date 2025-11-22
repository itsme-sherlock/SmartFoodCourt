'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Heart, Share2, MessageCircle, Copy, Star } from 'lucide-react';
import { toast } from 'sonner';
import { DiscoveryItem, ShareDiscovery } from '@/lib/types';
import AIBadge from '@/components/ui/AIBadge';

export default function Discover() {
  const router = useRouter();
  const { user } = useAuth();
  const [discoveryItems, setDiscoveryItems] = useState<DiscoveryItem[]>([]);
  const [shares, setShares] = useState<ShareDiscovery[]>([]);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [shareMessage, setShareMessage] = useState('');
  const [selectedItemToShare, setSelectedItemToShare] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Mock discovery items
  const mockDiscoveryItems: DiscoveryItem[] = [
    {
      id: 'disc_1',
      name: 'Saffron Paneer Kebab',
      description: 'Soft paneer cubes marinated in saffron and yogurt, grilled to perfection. A North Indian delicacy.',
      imageUrl: '🍗',
      vendorId: 'vendor_1',
      vendorName: 'North Indian Delights',
      category: 'Kebab',
      price: 180,
      rating: 4.8,
      isNew: true,
      discoverCount: 342,
      shares: 87,
    },
    {
      id: 'disc_2',
      name: 'Coconut Mint Dosa',
      description: 'Crispy dosa with a unique coconut mint filling. Sweet, savory, and refreshing. Perfect for brunch!',
      imageUrl: '🥘',
      vendorId: 'vendor_2',
      vendorName: 'South Indian Express',
      category: 'Dosa',
      price: 120,
      rating: 4.6,
      isNew: true,
      discoverCount: 256,
      shares: 64,
    },
    {
      id: 'disc_3',
      name: 'Tandoori Prawns',
      description: 'Juicy tandoori prawns marinated with aromatic spices. A seafood lover\'s dream. High in protein!',
      imageUrl: '🦐',
      vendorId: 'vendor_3',
      vendorName: 'Grill Master',
      category: 'Seafood',
      price: 250,
      rating: 4.9,
      isNew: false,
      discoverCount: 456,
      shares: 128,
    },
    {
      id: 'disc_4',
      name: 'Choco Lava Cake',
      description: 'Warm chocolate cake with molten chocolate center. Served with vanilla ice cream. Decadent!',
      imageUrl: '🍰',
      vendorId: 'vendor_4',
      vendorName: 'Happy Bites',
      category: 'Dessert',
      price: 80,
      rating: 4.9,
      isNew: false,
      discoverCount: 598,
      shares: 245,
    },
    {
      id: 'disc_5',
      name: 'Thai Green Curry',
      description: 'Authentic Thai green curry with vegetables and tofu. Aromatic coconut milk with green chilies.',
      imageUrl: '🍛',
      vendorId: 'vendor_1',
      vendorName: 'North Indian Delights',
      category: 'Curry',
      price: 160,
      rating: 4.7,
      isNew: true,
      discoverCount: 213,
      shares: 52,
    },
    {
      id: 'disc_6',
      name: 'Organic Quinoa Buddha Bowl',
      description: 'Nutritious bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing. Vegan & healthy!',
      imageUrl: '🥗',
      vendorId: 'vendor_4',
      vendorName: 'Happy Bites',
      category: 'Salad',
      price: 150,
      rating: 4.5,
      isNew: true,
      discoverCount: 189,
      shares: 41,
    },
  ];

  // Mock shares
  const mockShares: ShareDiscovery[] = [
    {
      id: 'share_1',
      itemId: 'disc_1',
      shareById: 'emp_1',
      shareByName: 'Raj Kumar',
      message: '🤤 OMG this Saffron Paneer Kebab is INCREDIBLE! Everyone must try it!',
      sharedWith: 'all',
      timestamp: new Date('2025-11-16T14:30:00'),
      reactions: 45,
      comments: 12,
    },
    {
      id: 'share_2',
      itemId: 'disc_4',
      shareById: 'emp_2',
      shareByName: 'Priya Singh',
      message: 'Found the best dessert ever! 🍫 Choco Lava Cake from Happy Bites is life-changing.',
      sharedWith: 'all',
      timestamp: new Date('2025-11-16T12:15:00'),
      reactions: 67,
      comments: 18,
    },
    {
      id: 'share_3',
      itemId: 'disc_3',
      shareById: 'emp_3',
      shareByName: 'Amit Sharma',
      message: 'Seafood lovers, check this out! Tandoori Prawns at Grill Master - fresh and delicious 🦐',
      sharedWith: 'all',
      timestamp: new Date('2025-11-16T11:00:00'),
      reactions: 34,
      comments: 9,
    },
  ];

  useEffect(() => {
    setDiscoveryItems(mockDiscoveryItems);
    setShares(mockShares);
  }, []);

  const handleLike = (itemId: string) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(itemId)) {
      newLiked.delete(itemId);
      toast.info('Removed from favorites');
    } else {
      newLiked.add(itemId);
      toast.success('Added to favorites! ❤️');
    }
    setLikedItems(newLiked);
  };

  const handleShareClick = (itemId: string) => {
    setSelectedItemToShare(itemId);
    setShowShareModal(true);
  };

  const handleSubmitShare = () => {
    if (!shareMessage.trim()) {
      toast.error('Please write a message to share');
      return;
    }

    const item = discoveryItems.find(i => i.id === selectedItemToShare);
    if (!item) return;

    const newShare: ShareDiscovery = {
      id: `share_${Date.now()}`,
      itemId: selectedItemToShare || '',
      shareById: user?.id || 'emp_unknown',
      shareByName: user?.name || 'Anonymous',
      message: shareMessage,
      sharedWith: 'all',
      timestamp: new Date(),
      reactions: 0,
      comments: 0,
    };

    setShares([newShare, ...shares]);
    setShareMessage('');
    setSelectedItemToShare(null);
    setShowShareModal(false);

    toast.success('Shared with everyone! 🎉', {
      description: `Your discovery of "${item.name}" is now visible to all.`,
    });
  };

  const handleCopyShareText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/employee/home" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🔍 Discover & Share
              </h1>
              <p className="text-sm text-gray-600">Find new items and share with friends</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Discovery Items Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">✨ Unexplored Items</h2>
              <AIBadge text="Personalized" size="sm" />
            </div>
            <span className="bg-linear-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {discoveryItems.length} items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discoveryItems.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Item Header with New Badge */}
                <div className="p-4 bg-linear-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">{item.imageUrl}</span>
                    {item.isNew && <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">NEW</span>}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                  <p className="text-xs text-blue-600 font-medium mt-1">@ {item.vendorName}</p>
                </div>

                {/* Item Details */}
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{item.description}</p>

                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="bg-yellow-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Category</p>
                      <p className="text-sm font-bold text-gray-900">{item.category}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Price</p>
                      <p className="text-sm font-bold text-blue-600">₹{item.price}</p>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded">
                      <div className="flex items-center justify-center gap-1">
                        <Star size={14} className="text-yellow-500" />
                        <p className="text-sm font-bold text-gray-900">{item.rating}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 mb-4 pb-3 border-b">
                    <span>👁️ {item.discoverCount} discovered</span>
                    <span>📤 {item.shares} shares</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition font-medium ${
                        likedItems.has(item.id)
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart size={16} fill={likedItems.has(item.id) ? 'currentColor' : 'none'} />
                      Like
                    </button>
                    <button
                      onClick={() => handleShareClick(item.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-medium"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Shares */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">💬 Community Discoveries</h2>

          <div className="space-y-4">
            {shares.map(share => {
              const sharedItem = discoveryItems.find(i => i.id === share.itemId);
              return (
                <div key={share.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{share.shareByName}</h3>
                      <p className="text-xs text-gray-600 mt-1">{share.timestamp.toLocaleString()}</p>
                    </div>
                    <span className="text-2xl">{sharedItem?.imageUrl}</span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-gray-800 italic">"{share.message}"</p>
                  </div>

                  {sharedItem && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-3 border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium mb-1">About: {sharedItem.name}</p>
                      <p className="text-sm font-bold text-gray-900">@ {sharedItem.vendorName}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-600">
                      <span>❤️ {share.reactions} reactions</span>
                      <span>💬 {share.comments} comments</span>
                    </div>
                    <button
                      onClick={() => handleCopyShareText(share.message)}
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition"
                    >
                      <Copy size={16} />
                      Copy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800">
            <strong>💡 Discovery Tips:</strong> Like items you love, share discoveries to help others find amazing
            food, and check back regularly for new unexplored items!
          </p>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Share Your Discovery</h2>

            {selectedItemToShare && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-600 font-medium">
                  Item: {discoveryItems.find(i => i.id === selectedItemToShare)?.name}
                </p>
              </div>
            )}

            <textarea
              placeholder="Write something about this item... E.g., 'Just tried this and it's amazing!' 🤤"
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareMessage('');
                  setSelectedItemToShare(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitShare}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
