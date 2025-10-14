'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Calendar, X } from 'lucide-react';
import { BookingFlow } from './BookingFlow';

interface BusinessInfoPageProps {
  business: any;
  branches: any[];
  services: any[];
  staff: any[];
}

export function BusinessInfoPage({ business, branches, services, staff }: BusinessInfoPageProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Helper to format business hours
  const formatBusinessHours = () => {
    if (!business.businessHours) return null;
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    
    return days.map((day, index) => {
      const hours = business.businessHours[day];
      if (!hours || !hours.isOpen) return null;
      
      return {
        day: dayNames[index],
        hours: `${hours.openTime} - ${hours.closeTime}`
      };
    }).filter(Boolean);
  };

  const businessHours = formatBusinessHours();

  return (
    <>
      {/* Main Info Page */}
      <div className="max-w-4xl mx-auto">
        {/* Hero Section with Logo */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-12 text-center text-white">
            {business.logoUrl && (
              <div className="mb-6 flex justify-center">
                <img 
                  src={business.logoUrl} 
                  alt={business.name}
                  className="h-32 w-32 object-contain bg-white rounded-2xl p-4 shadow-lg"
                />
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{business.name}</h1>
            {business.description && (
              <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                {business.description}
              </p>
            )}
          </div>

          <div className="p-8 md:p-12">
            {/* Always show CTA first */}
            <div className="mb-8">
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-6 px-8 rounded-xl text-xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 animate-pulse hover:animate-none"
              >
                <Calendar className="w-8 h-8" />
                קבע תור עכשיו
              </button>
            </div>

            {/* Contact Information */}
            {(business.phone || business.email || business.address) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Phone className="w-6 h-6 text-primary-600" />
                  פרטי יצירת קשר
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {business.phone && (
                    <a 
                      href={`tel:${business.phone}`}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                        <Phone className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">טלפון</div>
                        <div className="font-semibold text-gray-900">{business.phone}</div>
                      </div>
                    </a>
                  )}
                  {business.email && (
                    <a 
                      href={`mailto:${business.email}`}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                        <Mail className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">אימייל</div>
                        <div className="font-semibold text-gray-900">{business.email}</div>
                      </div>
                    </a>
                  )}
                  {business.address && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                      <div className="p-3 bg-primary-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">כתובת</div>
                        <div className="font-semibold text-gray-900">{business.address}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Business Hours */}
            {businessHours && businessHours.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-primary-600" />
                  שעות פעילות
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid gap-3">
                    {businessHours.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">{item.day}</span>
                        <span className="text-gray-600">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto my-8">
            {/* Close Button */}
            <button
              onClick={() => setShowBookingModal(false)}
              className="sticky top-4 left-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors ml-auto float-left"
              aria-label="סגור"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            {/* Booking Flow in Modal */}
            <div className="p-4 md:p-8 clear-both">
              <BookingFlow
                business={business}
                branches={branches}
                services={services}
                staff={staff}
                onBookingSuccess={() => setShowBookingModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
