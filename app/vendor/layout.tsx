// app/vendor/dashboard/layout.tsx
import React from 'react';

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* <h1>Vendor Dashboard</h1> */}
      <main>{children}</main>
    </div>
  );
}
