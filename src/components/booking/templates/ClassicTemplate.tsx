'use client';

import { useState } from 'react';
import { Business, Branch, Service, Staff, BusinessHours } from '@prisma/client';
import { Phone, Mail, MapPin, Clock, Calendar, DollarSign, User, Building2, ArrowLeft } from 'lucide-react';
import { BookingFlow } from '../BookingFlow';

interface ClassicTemplateProps {
  business: Business & {
    branches: Branch[];
    services: Service[];
    staff: Staff[];
    businessHours: BusinessHours[];
  };
}

export function ClassicTemplate({ business }: ClassicTemplateProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const formatBusinessHours = () => {
    const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const hoursMap: { [key: number]: string[] } = {};

    business.businessHours.forEach(bh => {
      if (!hoursMap[bh.weekday]) {
        hoursMap[bh.weekday] = [];
      }
      hoursMap[bh.weekday].push(`${bh.openTime.substring(0, 5)} - ${bh.closeTime.substring(0, 5)}`);
    });

    return daysOfWeek.map((dayName, index) => {
      const hours = hoursMap[index];
      if (!hours) return null;
      return { day: dayName, hours: hours.join(', ') };
    }).filter(Boolean);
  };

  const businessHours = formatBusinessHours();

  return (
    <>
      {/* Classic Vertical Professional Design */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto">
          {/* Header Card */}
          <div className="bg-white border-b">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                {business.logoUrl ? (
                  <img
                    src={business.logoUrl}
                    alt={business.name}
                    className="w-16 h-16 rounded-lg object-contain bg-gray-50 p-2"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                    {business.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{business.name}</h1>
                  {business.description && (
                    <p className="text-sm text-gray-600">{business.description}</p>
                  )}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                {business.address && (
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">מיקום</div>
                      <div className="text-sm font-medium text-gray-900">{business.address}</div>
                    </div>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">טלפון</div>
                      <div className="text-sm font-medium text-gray-900">{business.phone}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Services Section */}
          {business.services.length > 0 && (
            <div className="bg-white border-b p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                שירותים זמינים
              </h2>
              <div className="space-y-3">
                {business.services.map((service) => (
                  <div
                    key={service.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-600 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => setShowBookingModal(true)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{service.name}</h3>
                      <span className="text-lg font-bold text-gray-900">₪{service.price}</span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{service.duration} דקות</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staff Section */}
          {business.staff.length > 0 && business.showStaff && (
            <div className="bg-white border-b p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                הצוות המקצועי
              </h2>
              <div className="space-y-3">
                {business.staff.map((staff) => (
                  <div key={staff.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                    {staff.avatarUrl ? (
                      <img
                        src={staff.avatarUrl}
                        alt={staff.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 text-lg font-bold">
                        {staff.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">{staff.name}</h3>
                      {staff.title && (
                        <p className="text-sm text-gray-600">{staff.title}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Working Hours */}
          {businessHours.length > 0 && (
            <div className="bg-white border-b p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-600" />
                שעות פעילות
              </h2>
              <div className="space-y-2">
                {businessHours.map((item) => (
                  <div key={item!.day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="font-medium text-gray-900">{item!.day}</span>
                    <span className="text-sm text-gray-600">{item!.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">יצירת קשר</h2>
            <div className="space-y-3">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-gray-900">{business.phone}</span>
                </a>
              )}
              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-gray-900">{business.email}</span>
                </a>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <div className="bg-white p-6 sticky bottom-0 border-t shadow-lg">
            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full bg-gray-900 text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              קביעת תור
            </button>
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
            />
          </div>
        </div>
      )}
    </>
  );
}

