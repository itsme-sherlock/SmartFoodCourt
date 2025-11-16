"use client";
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

interface MenuLink {
  label: string;
  href: string;
  icon?: string;
}

interface MobileMenuProps {
  userName?: string;
  user?: { name?: string; role?: string } | null;
  menuLinks?: MenuLink[];
  links?: MenuLink[];
  onLogout: () => void;
}

export default function MobileMenu({ userName, user, menuLinks, links, onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Support both prop names: menuLinks or links
  const finalMenuLinks = menuLinks || links || [];
  // Support both userName or user.name
  const displayName = userName || user?.name || 'Guest';

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <>
      {/* Mobile Header - Only shows on mobile */}
      <div className="md:hidden w-full bg-white shadow-sm px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-blue-600">🍽️ Food Court</h1>
          <p className="text-gray-600 text-sm">Welcome, {displayName}</p>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu - Only shows when open */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md p-4 space-y-4 border-b">
          {finalMenuLinks && finalMenuLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-blue-600 hover:text-blue-800 hover:underline font-medium"
              onClick={() => setIsOpen(false)}
            >
              {link.icon && <span className="mr-2">{link.icon}</span>}
              {link.label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-semibold transition"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </>
  );
}
