'use client';

import { Business, Subscription, Package, UsageCounter } from '@prisma/client';
import { Calendar, Users, Building2, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

type SubscriptionWithPackage = Subscription & {
  package: Package;
};

type BusinessWithSubscription = Business & {
  subscription: SubscriptionWithPackage | null;
  _count?: {
    staff?: number;
    branches?: number;
  };
};

interface SubscriptionCardProps {
  subscription: SubscriptionWithPackage;
  usage: UsageCounter | null;
  business: BusinessWithSubscription;
}

export function SubscriptionCard({ subscription, usage, business }: SubscriptionCardProps) {
  const pkg = subscription.package;
  const appointmentsUsage = usage?.appointmentsCount || 0;
  const appointmentsPercentage = (appointmentsUsage / pkg.monthlyAppointmentsCap) * 100;

  const stats = [
    {
      label: 'תורים בחודש',
      value: `${appointmentsUsage} / ${pkg.monthlyAppointmentsCap}`,
      icon: Calendar,
      percentage: appointmentsPercentage,
    },
    {
      label: 'עובדים',
      value: `${business._count?.staff || 0} / ${pkg.maxStaff}`,
      icon: Users,
    },
    {
      label: 'סניפים',
      value: `${business._count?.branches || 0} / ${pkg.maxBranches}`,
      icon: Building2,
    },
  ];

  return (
    <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">{pkg.name}</h2>
          <p className="text-primary-100">
            {subscription.status === 'trial' ? 'תקופת ניסיון' : 'מנוי פעיל'}
          </p>
        </div>
        <div className="text-left">
          <p className="text-3xl font-bold">
            {formatPrice(pkg.priceCents)}
          </p>
          <p className="text-primary-100 text-sm">לחודש</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5" />
                <span className="text-sm opacity-90">{stat.label}</span>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              {stat.percentage !== undefined && (
                <div className="mt-2">
                  <div className="bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all"
                      style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {subscription.status === 'trial' && (
        <div className="mt-6 p-4 bg-yellow-400/20 rounded-lg">
          <p className="text-sm">
            <strong>תקופת הניסיון מסתיימת ב:</strong>{' '}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString('he-IL')}
          </p>
        </div>
      )}
    </div>
  );
}

