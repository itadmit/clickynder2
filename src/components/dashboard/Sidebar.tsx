'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Scissors,
  Calendar,
  Settings,
  CreditCard,
  BarChart3,
  LogOut,
  UserCircle,
  User,
  Menu,
  X,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'דשבורד',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'עובדים',
    href: '/dashboard/staff',
    icon: Users,
  },
  {
    title: 'סניפים',
    href: '/dashboard/branches',
    icon: Building2,
  },
  {
    title: 'שירותים',
    href: '/dashboard/services',
    icon: Scissors,
  },
  {
    title: 'תורים',
    href: '/dashboard/appointments',
    icon: Calendar,
  },
  {
    title: 'לקוחות',
    href: '/dashboard/customers',
    icon: UserCircle,
  },
  {
    title: 'סטטיסטיקות',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'הגדרות',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    title: 'חבילה ומנוי',
    href: '/dashboard/subscription',
    icon: CreditCard,
  },
  {
    title: 'פרופיל',
    href: '/dashboard/profile',
    icon: User,
  },
];

interface SidebarProps {
  onToggle?: () => void;
  businessName?: string;
  businessLogo?: string | null;
}

export function Sidebar({ onToggle, businessName, businessLogo }: SidebarProps = {}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleOpen = () => {
    setIsOpen(true);
    onToggle?.();
  };

  // Expose open function through custom event
  useEffect(() => {
    const handleOpenSidebar = () => setIsOpen(true);
    window.addEventListener('openSidebar', handleOpenSidebar);
    return () => window.removeEventListener('openSidebar', handleOpenSidebar);
  }, []);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 h-screen w-64 bg-white border-l border-gray-200 flex flex-col z-50 transition-transform duration-300 ease-in-out',
          // Desktop: always visible on the right
          'lg:right-0 lg:translate-x-0',
          // Mobile: slide from right
          'right-0',
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
        <Link href="/dashboard" className="flex-1 min-w-0 flex items-center justify-center gap-2">
          {businessLogo ? (
            <img 
              src={businessLogo} 
              alt={businessName || 'Logo'} 
              className="h-8 lg:h-10 w-auto object-contain" 
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm lg:text-base">
                  {businessName ? businessName.charAt(0) : 'C'}
                </span>
              </div>
              <span className="font-bold text-gray-900 text-sm lg:text-base truncate">
                {businessName || 'Clickinder'}
              </span>
            </div>
          )}
        </Link>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="סגור תפריט"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Special handling for dashboard root - should only be active on exact match
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>התנתק</span>
        </button>
      </div>
    </aside>
    </>
  );
}
