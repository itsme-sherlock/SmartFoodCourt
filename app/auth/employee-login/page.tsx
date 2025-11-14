"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { mockEmployees } from '@/lib/mockData';

export default function EmployeeLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [employeeId, setEmployeeId] = useState('');

  const handleLogin = () => {
    const employee = mockEmployees.find(e => e.employeeId === employeeId);
    if (employee) {
      login(employee);
      router.push('/employee/home');
    } else {
      alert('Invalid Employee ID. Try: EMP001 or EMP002');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Employee Login
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Employee ID
          </label>
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="e.g., EMP001"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-black"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Login
        </button>

        <p className="text-center text-gray-600 text-sm mt-4">
          Demo IDs: EMP001, EMP002
        </p>
      </div>
    </div>
  );
}
