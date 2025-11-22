import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { MenuProvider } from "@/context/MenuContext";
import { Toaster } from "@/components/ui/sonner";
import FoodGenie from "@/components/FoodGenie";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Food Court Ordering System",
  description: "Campus food court ordering and billing solution",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          <MenuProvider>
            {children}
            <FoodGenie />
            <Toaster />
          </MenuProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
