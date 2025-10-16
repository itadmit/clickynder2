'use client';

import { Business, Branch, Service, Staff, BusinessHours, ServiceCategory } from '@prisma/client';
import { BookingFlow } from '../BookingFlow';
import { CustomCode } from '../CustomCode';
import type { StaffWithServices } from '../BookingFlow';

interface ModernTemplateProps {
  business: Business & {
    branches: Branch[];
    services: (Service & { category: ServiceCategory | null })[];
    staff: StaffWithServices[];
    businessHours: BusinessHours[];
  };
}

export function ModernTemplate({ business }: ModernTemplateProps) {
  return (
    <>
      {/* Custom CSS and JS */}
      {business.developerMode && (
        <CustomCode customCss={business.customCss} customJs={business.customJs} />
      )}
      
      <div 
        className="min-h-screen relative"
        style={{ 
          background: `linear-gradient(to bottom right, ${business.backgroundColorStart || '#dbeafe'}, ${business.backgroundColorEnd || '#faf5ff'})`,
          fontFamily: business.font ? `'${business.font}', 'Noto Sans Hebrew', sans-serif` : "'Noto Sans Hebrew', sans-serif"
        }}
      >
      {/* Header - Transparent */}
      <header 
        className="py-4 px-4 sticky top-0 z-50 backdrop-blur-lg shadow-md"
        style={{
          backgroundColor: business.primaryColor ? `${business.primaryColor}B3` : '#3b82f6B3'
        }}
      >
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-center gap-4">
            {business.logoUrl && (
              <img 
                src={business.logoUrl} 
                alt={business.name}
                className="h-12 w-12 object-contain rounded-lg bg-white/90 p-2"
              />
            )}
            <div className="text-white text-center">
              <h1 className="text-xl md:text-2xl font-bold">{business.name}</h1>
              {business.description && (
                <p className="text-xs md:text-sm opacity-90 mt-0.5">
                  {business.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Booking Flow */}
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <BookingFlow
          business={business}
          branches={business.branches}
          services={business.services}
          staff={business.staff}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4 mt-12 text-center">
        <p className="text-sm text-gray-600">
          מופעל על ידי <span className="font-semibold text-indigo-600">Clickinder</span>
        </p>
      </footer>
    </div>
    </>
  );
}

