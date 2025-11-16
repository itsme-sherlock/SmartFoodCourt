// app/vendor/dashboard/layout.tsx
import React from 'react';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* <h1>admin Dashboard</h1> */}
      <main>{children}</main>
    </div>
  );
}
