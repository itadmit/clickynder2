'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, ExternalLink, UserCircle, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useBusiness } from '@/contexts/BusinessContext';

export function UserDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const { slug } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  const menuItems = [
    {
      label: 'צפייה בעמוד התורים',
      icon: ExternalLink,
      onClick: () => {
        if (!slug) {
          console.error('Business slug is not available');
          return;
        }
        const bookingUrl = `${window.location.origin}/${slug}`;
        window.open(bookingUrl, '_blank');
        setIsOpen(false);
      },
      disabled: !slug,
    },
    {
      type: 'divider' as const,
    },
    {
      label: 'מעבר לפרופיל',
      icon: UserCircle,
      onClick: () => {
        router.push('/dashboard/profile');
        setIsOpen(false);
      },
    },
    {
      label: 'הגדרות',
      icon: Settings,
      onClick: () => {
        router.push('/dashboard/settings');
        setIsOpen(false);
      },
    },
    {
      type: 'divider' as const,
    },
    {
      label: 'התנתק',
      icon: LogOut,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="תפריט משתמש"
      >
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="text-sm text-right hidden sm:block">
          {session?.user?.name ? (
            <>
              <p className="font-medium text-gray-900 text-sm truncate max-w-[120px]">
                {session.user.name}
              </p>
              <p className="text-gray-500 text-xs truncate max-w-[120px]">
                {session.user.email}
              </p>
            </>
          ) : (
            <>
              {/* Skeleton Loader */}
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {menuItems.map((item, index) => {
            if (item.type === 'divider') {
              return <div key={index} className="h-px bg-gray-200 my-1" />;
            }

            const Icon = item.icon!;
            return (
              <button
                key={index}
                onClick={item.onClick}
                disabled={item.disabled}
                className={`w-full px-4 py-2 text-right flex items-center gap-3 transition-colors ${
                  item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : item.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

