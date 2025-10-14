'use client';

import { useState } from 'react';
import { Business, Branch, Service, Staff, BusinessHours, ServiceCategory } from '@prisma/client';
import { Phone, Mail, MapPin, Clock, Calendar, Star, ArrowLeft } from 'lucide-react';
import { BookingFlow } from '../BookingFlow';
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
  const [showBookingModal, setShowBookingModal] = useState(false);

  return (
    <>
      {/* Modern Clean Design - Like Medical App */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            {business.logoUrl && (
              <img src={business.logoUrl} alt={business.name} className="h-10 w-auto" />
            )}
            <button
              onClick={() => setShowBookingModal(true)}
              className="btn btn-primary text-sm px-6 py-2 rounded-full"
            >
              קבע תור
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Hero Card */}
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
            <div className="flex items-start gap-6">
              {business.logoUrl && (
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-1">
                    <img
                      src={business.logoUrl}
                      alt={business.name}
                      className="w-full h-full rounded-xl object-contain bg-white"
                    />
                  </div>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
                  <div className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                    <span className="text-sm font-bold text-amber-700">4.8</span>
                  </div>
                </div>
                {business.description && (
                  <p className="text-gray-600 mb-4">{business.description}</p>
                )}
                
                {/* Quick Info */}
                <div className="flex flex-wrap gap-4">
                  {business.businessHours?.[0]?.openTime && business.businessHours[0].closeTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-primary-600" />
                      <span>שעות פעילות: {business.businessHours[0].openTime.substring(0, 5)} - {business.businessHours[0].closeTime.substring(0, 5)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          {business.services.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">השירותים שלנו</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {business.services.slice(0, 4).map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setShowBookingModal(true)}
                  >
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{service.durationMin} דקות</span>
                      </div>
                      {service.priceCents && (
                        <span className="text-lg font-bold text-gray-900">₪{(service.priceCents / 100).toFixed(0)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Section */}
          {business.staff.length > 0 && business.showStaff && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">הצוות שלנו</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {business.staff.map((staff) => (
                  <div
                    key={staff.id}
                    className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition-shadow"
                  >
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-primary-100">
                      {staff.name.charAt(0)}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{staff.name}</h3>
                    {staff.roleLabel && (
                      <p className="text-sm text-gray-600">{staff.roleLabel}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">צור קשר</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">טלפון</div>
                    <div className="font-semibold text-gray-900">{business.phone}</div>
                  </div>
                </a>
              )}
              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">אימייל</div>
                    <div className="font-semibold text-gray-900">{business.email}</div>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-12 py-4 rounded-full text-lg font-bold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-3"
            >
              <Calendar className="w-6 h-6" />
              קבע תור עכשיו
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

