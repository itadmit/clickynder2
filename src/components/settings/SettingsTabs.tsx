'use client';

import { useState } from 'react';
import { Building2, Phone, Clock, Bell, Globe } from 'lucide-react';

interface SettingsTabsProps {
  children: React.ReactNode[];
}

const tabs = [
  { id: 'general', label: 'כללי', icon: Building2 },
  { id: 'booking-page', label: 'עמוד קביעת תורים', icon: Globe },
  { id: 'contact', label: 'פרטי יצירת קשר', icon: Phone },
  { id: 'hours', label: 'שעות עבודה', icon: Clock },
  { id: 'slots', label: 'זמני פגישות', icon: Clock },
  { id: 'notifications', label: 'התראות', icon: Bell },
];

export function SettingsTabs({ children }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={activeTab === tab.id ? 'block' : 'hidden'}
          >
            {children[index]}
          </div>
        ))}
      </div>
    </div>
  );
}

