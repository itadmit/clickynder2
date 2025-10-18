'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Menu } from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';
import { UserDropdown } from './UserDropdown';
import { useBusiness } from '@/contexts/BusinessContext';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { name: businessName, logoUrl: businessLogo } = useBusiness();

  const handleOpenSidebar = () => {
    window.dispatchEvent(new Event('openSidebar'));
  };

  return (
    <>
      {/* Mobile: Sticky small header with logo */}
      <header className="lg:hidden bg-white border-b border-gray-200 w-full sticky top-0 z-20 shadow-sm">
        <div className="w-full px-4 py-2 relative">
          <div className="flex justify-between items-center gap-2">
            {/* Menu Button - Right side */}
            <button 
              onClick={handleOpenSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="פתח תפריט"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Logo - Absolute Center */}
            <button 
              onClick={() => router.push('/dashboard')}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
              aria-label="עבור לדשבורד"
            >
              <img 
                src="/assets/logo.png" 
                alt="Clickinder" 
                className="h-7 w-auto object-contain" 
              />
            </button>

            {/* Profile & Notifications - Left side */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Notifications */}
              <NotificationsDropdown />

              {/* User Dropdown */}
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile: Scrollable page title */}
      <div className="lg:hidden bg-white border-b border-gray-200 w-full px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Desktop: Original sticky header */}
      <header className="hidden lg:block bg-white border-b border-gray-200 w-full sticky top-0 z-10">
        <div className="w-full px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1 truncate">{subtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Notifications */}
                <NotificationsDropdown />

                {/* User Dropdown */}
                <UserDropdown />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

