'use client';

import { useState } from 'react';
import { Business, Branch, Service, Staff, BusinessHours, ServiceCategory } from '@prisma/client';
import { Phone, Mail, Clock, Sparkles, Star, X } from 'lucide-react';
import { BookingFlow } from '../BookingFlow';
import { CustomCode } from '../CustomCode';
import type { StaffWithServices } from '../BookingFlow';

interface MinimalTemplateProps {
  business: Business & {
    branches: Branch[];
    services: (Service & { category: ServiceCategory | null })[];
    staff: StaffWithServices[];
    businessHours: BusinessHours[];
  };
}

export function MinimalTemplate({ business }: MinimalTemplateProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const primaryColor = business.primaryColor || '#d4af37'; // זהב
  const secondaryColor = business.secondaryColor || '#c0a080'; // ברונזה

  return (
    <>
      {/* Custom CSS and JS */}
      {business.developerMode && (
        <CustomCode customCss={business.customCss} customJs={business.customJs} />
      )}
      
      {/* Spa/Restaurant Menu Design - Elegant & Luxurious */}
      <div 
        className="min-h-screen"
        style={{ 
          fontFamily: business.font ? `'${business.font}', 'Noto Sans Hebrew', sans-serif` : "'Noto Sans Hebrew', sans-serif",
          background: `linear-gradient(to bottom, #faf9f6, #f5f1ea)`,
        }}
      >
        {/* Elegant Header */}
        <div className="text-center py-12 px-4">
          {business.logoUrl && (
            <div className="mb-6">
              <img
                src={business.logoUrl}
                alt={business.name}
                className="h-24 w-24 object-contain mx-auto opacity-90"
              />
            </div>
          )}
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16" style={{ backgroundColor: primaryColor }}></div>
            <Sparkles className="w-6 h-6" style={{ color: primaryColor }} />
            <div className="h-px w-16" style={{ backgroundColor: primaryColor }}></div>
          </div>

          <h1 
            className="text-4xl md:text-5xl mb-4 tracking-wide"
            style={{ color: primaryColor, fontWeight: 900 }}
          >
            {business.name}
          </h1>
          
          {business.description && (
            <p className="text-gray-600 text-lg max-w-2xl mx-auto font-light italic">
              {business.description}
            </p>
          )}
        </div>

        {/* Menu-Style Services */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {business.services.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border" style={{ borderColor: `${primaryColor}20` }}>
              {/* Menu Header */}
              <div className="text-center py-8 px-6 border-b" style={{ borderColor: `${primaryColor}30` }}>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Star className="w-5 h-5" style={{ color: primaryColor }} />
                  <h2 
                    className="text-3xl tracking-wider"
                    style={{ color: primaryColor, fontWeight: 900 }}
                  >
                    השירותים שלנו
                  </h2>
                  <Star className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <p className="text-gray-500 text-sm font-normal">לפניכם רשימת השירותים שלנו</p>
              </div>

              {/* Services List - Restaurant Menu Style */}
              <div className="p-8 space-y-6">
                {business.services.map((service, index) => (
                  <div
                    key={service.id}
                    className="group cursor-pointer hover:bg-gray-50/50 transition-all p-4 rounded-lg"
                    onClick={() => setShowBookingModal(true)}
                  >
                    {/* Service Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-2xl" style={{ color: primaryColor, fontWeight: 900 }}>
                            {service.name}
                          </h3>
                          <div className="flex-1 border-b border-dotted border-gray-300 group-hover:border-gray-400 transition-colors"></div>
                        </div>
                      </div>
                      
                      {service.priceCents > 0 ? (
                        <span 
                          className="text-2xl mr-4"
                          style={{ color: primaryColor, fontWeight: 900 }}
                        >
                          ₪{(service.priceCents / 100).toFixed(0)}
                        </span>
                      ) : service.priceCents === 0 ? (
                        <span 
                          className="text-xl mr-4"
                          style={{ color: '#10b981', fontWeight: 700 }}
                        >
                          חינם
                        </span>
                      ) : null}
                    </div>

                    {/* Service Description */}
                    {service.description && (
                      <p className="text-gray-600 text-sm mb-2 font-normal leading-relaxed">
                        {service.description}
                      </p>
                    )}

                    {/* Duration */}
                    <div className="flex items-center gap-2 text-xs font-normal" style={{ color: secondaryColor }}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{service.durationMin} דקות</span>
                    </div>

                    {/* Divider (not for last item) */}
                    {index < business.services.length - 1 && (
                      <div className="mt-6 border-b" style={{ borderColor: `${primaryColor}10` }}></div>
                    )}
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="text-center py-8 px-6 border-t" style={{ borderColor: `${primaryColor}30` }}>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="px-12 py-4 rounded-full text-white font-light text-lg tracking-wider hover:shadow-xl transition-all transform hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                >
                  לקביעת תור
                </button>
              </div>
            </div>
          )}

          {/* Footer - Contact Info */}
          <div className="text-center py-12 mt-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16" style={{ backgroundColor: primaryColor }}></div>
              <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
              <div className="h-px w-16" style={{ backgroundColor: primaryColor }}></div>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mb-6">
              {business.phone && (
                <a 
                  href={`tel:${business.phone}`} 
                  className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                  style={{ color: primaryColor }}
                >
                  <Phone className="w-4 h-4" />
                  <span className="font-light">{business.phone}</span>
                </a>
              )}
              {business.email && (
                <a 
                  href={`mailto:${business.email}`} 
                  className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                  style={{ color: primaryColor }}
                >
                  <Mail className="w-4 h-4" />
                  <span className="font-light">דוא"ל</span>
                </a>
              )}
            </div>

            <p className="text-xs text-gray-400 font-light">
              מופעל על ידי <span style={{ color: primaryColor }}>Clickinder</span>
            </p>
          </div>
        </div>
      </div>

      {/* Booking Modal - Full Screen */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={() => setShowBookingModal(false)}
            className="fixed top-4 left-4 z-50 p-3 rounded-full shadow-lg hover:shadow-xl transition-all bg-white"
            style={{
              color: primaryColor,
            }}
            aria-label="סגור"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div 
            className="sticky top-0 z-40 backdrop-blur-lg shadow-md py-4 px-4"
            style={{
              backgroundColor: `${primaryColor}15`
            }}
          >
            <div className="container mx-auto max-w-5xl text-center">
              <h1 className="text-2xl font-light" style={{ color: primaryColor }}>
                {business.name}
              </h1>
            </div>
          </div>

          {/* Booking Flow */}
          <div className="container mx-auto max-w-5xl px-4 py-8">
            <BookingFlow
              business={business}
              branches={business.branches}
              services={business.services}
              staff={business.staff}
              onBookingSuccess={() => setShowBookingModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

