'use client';

import { useState } from 'react';
import { Business, Branch, Service, Staff, BusinessHours, ServiceCategory } from '@prisma/client';
import { Phone, Mail, MapPin, Clock, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { BookingFlow } from '../BookingFlow';
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
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const primaryColor = business.primaryColor || '#ef4444';
  const secondaryColor = business.secondaryColor || '#ec4899';

  return (
    <>
      {/* Minimal Bold Design - Like Barber Shop */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section with Big Image */}
        <div 
          className="relative h-[60vh] bg-gradient-to-br overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
          }}
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
            {business.logoUrl && (
              <div className="mb-6">
                <img
                  src={business.logoUrl}
                  alt={business.name}
                  className="h-32 w-32 object-contain mx-auto drop-shadow-2xl"
                />
              </div>
            )}
            <h1 className="text-5xl md:text-6xl font-black mb-4 drop-shadow-lg">
              {business.name}
            </h1>
            {business.description && (
              <p className="text-xl md:text-2xl font-light max-w-2xl mb-8 opacity-95">
                {business.description}
              </p>
            )}
            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-white text-gray-900 px-10 py-5 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-2xl flex items-center gap-3"
            >
              קבע תור עכשיו
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Services - Bold Cards */}
          {business.services.length > 0 && (
            <div className="mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-8 text-center">השירותים שלנו</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {business.services.map((service) => (
                  <div
                    key={service.id}
                    className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2"
                    onClick={() => setShowBookingModal(true)}
                  >
                    {/* Color Strip */}
                    <div 
                      className="h-2"
                      style={{
                        background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                      }}
                    ></div>
                    
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h3>
                      {service.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-5 h-5" />
                          <span className="font-bold">{service.durationMin}'</span>
                        </div>
                        {service.priceCents && (
                          <span 
                            className="text-3xl font-black"
                            style={{ color: primaryColor }}
                          >
                            ₪{(service.priceCents / 100).toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staff - Image Focus */}
          {business.staff.length > 0 && business.showStaff && (
            <div className="mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-8 text-center">הצוות שלנו</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {business.staff.map((staff) => (
                  <div
                    key={staff.id}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedStaff(staff);
                      setShowBookingModal(true);
                    }}
                  >
                    <div 
                      className="aspect-[3/4] rounded-3xl mb-4 shadow-xl flex items-center justify-center text-white text-5xl font-black"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                      }}
                    >
                      {staff.name.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 text-center">{staff.name}</h3>
                    {staff.roleLabel && (
                      <p className="text-sm text-gray-600 text-center">{staff.roleLabel}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact - Bold CTA */}
          <div 
            className="rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
            }}
          >
            <div className="p-12 text-center text-white">
              <h2 className="text-4xl font-black mb-6">בואו לבקר אותנו</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {business.phone && (
                  <div className="flex flex-col items-center gap-2">
                    <Phone className="w-8 h-8" />
                    <a href={`tel:${business.phone}`} className="text-lg font-bold hover:underline">
                      {business.phone}
                    </a>
                  </div>
                )}
                {business.email && (
                  <div className="flex flex-col items-center gap-2">
                    <Mail className="w-8 h-8" />
                    <a href={`mailto:${business.email}`} className="text-lg font-bold hover:underline">
                      {business.email}
                    </a>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-white text-gray-900 px-12 py-5 rounded-full text-xl font-black hover:scale-105 transition-transform shadow-xl"
              >
                קבע תור עכשיו
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto my-8">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              aria-label="סגור"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <BookingFlow
              business={business}
              branches={business.branches}
              services={business.services}
              staff={business.staff}
              onBookingSuccess={() => setShowBookingModal(false)}
              initialStaffId={selectedStaff?.id}
            />
          </div>
        </div>
      )}
    </>
  );
}

