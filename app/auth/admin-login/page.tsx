"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { mockAdmins } from '@/lib/mockData';

export default function AdminLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [adminId, setAdminId] = useState('');

  const handleLogin = () => {
    const admin = mockAdmins.find(a => a.adminId === adminId);
    if (admin) {
      login(admin);
      router.push('/admin/dashboard');
    } else {
      alert('Invalid Admin ID. Try: ADM001');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
          Admin Login
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Admin ID
          </label>
          <input
            type="text"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            placeholder="e.g., ADM001"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Login
        </button>

        <p className="text-center text-gray-600 text-sm mt-4">
          Demo ID: ADM001
        </p>
      </div>
    </div>
  );
}