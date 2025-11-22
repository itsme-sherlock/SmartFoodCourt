"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';
import React from 'react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-3xl w-full text-center">
        {/* <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-linear-to-br from-indigo-500 to-pink-500 text-white mx-auto shadow-lg mb-6">
          <div className="text-6xl font-extrabold">404</div>
        </div> */}

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">We are Working on it</h1>
        {/* vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv */}
        <p className="text-gray-500 mb-6 font-medium">
          We apologize for the inconvenience. We are actively working to provide the requested feature and expect it to be available shortly.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white border border-gray-200 hover:shadow-sm text-gray-800"
          >
            <ArrowLeft size={18} /> Return to previous page
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            <Home size={18} /> Return to Home
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg p-4 text-left shadow-sm"> 
          <p className="text-sm text-gray-700">
            You may also try the following:
          </p>
          <div className="mt-3 flex flex-col md:flex-row gap-2">
            <Link href="/employee/discover" className="text-sm px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">Explore vendors</Link>
            <Link href="/employee/history" className="text-sm px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">Order history</Link>
            <Link href="/admin/analytics" className="text-sm px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">Administrative dashboard</Link>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-4">If you think this is an error, please contact the admin or try reloading later.</div>
      </div>
    </div>
  );
}
