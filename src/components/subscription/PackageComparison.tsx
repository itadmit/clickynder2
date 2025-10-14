'use client';

import { Package } from '@prisma/client';
import { Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface PackageComparisonProps {
  packages: Package[];
  currentPackageId?: string;
}

export function PackageComparison({ packages, currentPackageId }: PackageComparisonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {packages.map((pkg) => {
        const isCurrent = pkg.id === currentPackageId;
        const isPopular = pkg.code === 'pro';
        const features = (pkg.featuresJson as any)?.features || [];

        return (
          <div
            key={pkg.id}
            className={`
              card relative
              ${isPopular ? 'ring-2 ring-primary-600 shadow-xl' : ''}
              ${isCurrent ? 'bg-primary-50' : ''}
            `}
          >
            {isPopular && (
              <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg">
                מומלץ
              </div>
            )}

            {isCurrent && (
              <div className="absolute top-0 left-0 bg-green-600 text-white text-xs px-3 py-1 rounded-br-lg rounded-tl-lg">
                החבילה שלך
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">
                  {pkg.priceCents === 0 ? 'חינם' : formatPrice(pkg.priceCents)}
                </span>
                {pkg.priceCents > 0 && (
                  <span className="text-gray-600 text-sm">/חודש</span>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="text-sm text-gray-600">
                <strong>{pkg.maxStaff === 999 ? 'ללא הגבלה' : `עד ${pkg.maxStaff}`}</strong> עובדים
              </div>
              <div className="text-sm text-gray-600">
                <strong>{pkg.maxBranches === 999 ? 'ללא הגבלה' : `עד ${pkg.maxBranches}`}</strong> סניפים
              </div>
              <div className="text-sm text-gray-600">
                <strong>
                  {pkg.monthlyAppointmentsCap === 999999
                    ? 'ללא הגבלה'
                    : pkg.monthlyAppointmentsCap}
                </strong>{' '}
                תורים בחודש
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              {features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`
                btn w-full
                ${isCurrent ? 'btn-secondary cursor-not-allowed' : 'btn-primary'}
              `}
              disabled={isCurrent}
            >
              {isCurrent ? 'החבילה הנוכחית' : 'בחר חבילה'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

