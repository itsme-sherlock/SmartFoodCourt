"use client";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RoleSelection() {
  const router = useRouter();
  const { setRole } = useAuth();

  const handleRoleSelect = (role: 'employee' | 'vendor' | 'admin') => {
    setRole(role);
    router.push(`/auth/${role}-login`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          🍽️ Food Court System
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Select your role to continue
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect('employee')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            👤 Employee - Order Food
          </button>
          <button
            onClick={() => handleRoleSelect('vendor')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            🏪 Vendor - Manage Stall
          </button>
          <button
            onClick={() => handleRoleSelect('admin')}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            ⚙️ Admin - Control Center
          </button>
        </div>

        <p className="text-center text-gray-600 text-sm mt-8">
          Demo credentials available after selecting role
        </p>
      </div>
    </div>
  );
}
