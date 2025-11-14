"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { mockVendorUsers } from '@/lib/mockData';

export default function VendorLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [vendorId, setVendorId] = useState('');

  const handleLogin = () => {
    const vendor = mockVendorUsers.find(v => v.vendorId === vendorId);
    if (vendor) {
      login(vendor);
      router.push('/vendor/dashboard');
    } else {
      alert('Invalid Vendor ID. Try: VEN001, VEN002, or VEN003');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-green-600 mb-6">
          Vendor Login
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Vendor ID
          </label>
          <input
            type="text"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            placeholder="e.g., VEN001"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Login
        </button>

        <p className="text-center text-gray-600 text-sm mt-4">
          Demo IDs: VEN001, VEN002, VEN003
        </p>
      </div>
    </div>
  );
}