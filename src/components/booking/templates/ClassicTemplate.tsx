'use client';

import { useState } from 'react';
import { Business, Branch, Service, Staff, BusinessHours, ServiceCategory } from '@prisma/client';
import { Phone, Mail, MapPin, Clock, Calendar, DollarSign, User, Building2, ArrowLeft, Facebook, Instagram, Twitter, Youtube, MessageCircle, Send } from 'lucide-react';
import { BookingFlow } from '../BookingFlow';
import { CustomCode } from '../CustomCode';
import type { ServiceWithCategory, StaffWithServices } from '../BookingFlow';

interface ClassicTemplateProps {
  business: Business & {
    branches: Branch[];
    services: (Service & { category: ServiceCategory | null })[];
    staff: StaffWithServices[];
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
      if (bh.openTime && bh.closeTime) {
        hoursMap[bh.weekday].push(`${bh.openTime.substring(0, 5)}-${bh.closeTime.substring(0, 5)}`);
      }
    });

    return daysOfWeek.map((dayName, index) => {
      const hours = hoursMap[index];
      if (!hours) return null;
      return { day: dayName, hours: hours.join(', ') };
    }).filter(Boolean);
  };

  const businessHours = formatBusinessHours();

  const socialIcons = [
    { url: business.facebookUrl, icon: Facebook, label: 'Facebook' },
    { url: business.instagramUrl, icon: Instagram, label: 'Instagram' },
    { url: business.twitterUrl, icon: Twitter, label: 'Twitter' },
    { url: business.youtubeUrl, icon: Youtube, label: 'YouTube' },
    { url: business.whatsappNumber ? `https://wa.me/${business.whatsappNumber}` : null, icon: MessageCircle, label: 'WhatsApp' },
    { url: business.telegramUrl, icon: Send, label: 'Telegram' },
  ].filter(item => item.url);

  return (
    <>
      {/* Custom CSS and JS */}
      {business.developerMode && (
        <CustomCode customCss={business.customCss} customJs={business.customJs} />
      )}
      
      {/* Classic Centered Design - No Sticky Header */}
      <div 
        className="min-h-screen"
        style={{ 
          fontFamily: business.font ? `'${business.font}', 'Noto Sans Hebrew', sans-serif` : "'Noto Sans Hebrew', sans-serif",
          background: `linear-gradient(to bottom right, ${business.backgroundColorStart || '#dbeafe'}, ${business.backgroundColorEnd || '#faf5ff'})`
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Logo and Business Name - Centered */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
            {business.logoUrl ? (
              <div className="mb-4 flex justify-center">
                <img
                  src={business.logoUrl}
                  alt={business.name}
                  className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white"
                  style={{
                    boxShadow: `0 4px 20px ${business.primaryColor || '#3b82f6'}40`
                  }}
                />
              </div>
            ) : (
              <div 
                className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md"
                style={{ backgroundColor: business.primaryColor || '#3b82f6' }}
              >
                {business.name.charAt(0)}
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
            {business.description && (
              <p className="text-gray-600 mb-4">{business.description}</p>
            )}

            {/* Social Media Icons - Circles */}
            {socialIcons.length > 0 && (
              <div className="flex justify-center gap-3 mb-4">
                {socialIcons.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-md"
                      style={{ backgroundColor: business.secondaryColor || '#d946ef' }}
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}

            {/* Contact Info */}
            <div className="flex justify-center gap-4 text-sm text-gray-600">
              {business.phone && (
                <a 
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{business.phone}</span>
                </a>
              )}
              {business.email && (
                <a 
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>אימייל</span>
                </a>
              )}
            </div>
          </div>

          {/* Services Section */}
          {business.services.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">השירותים שלנו</h2>
              <div className="space-y-4">
                {business.services.map((service) => (
                  <div
                    key={service.id}
                    className="relative rounded-xl hover:shadow-xl transition-all cursor-pointer group"
                    style={{
                      background: `linear-gradient(135deg, ${business.primaryColor || '#3b82f6'}, ${business.secondaryColor || '#d946ef'})`,
                      padding: '2px',
                    }}
                    onClick={() => setShowBookingModal(true)}
                  >
                    {/* Inner white card */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{service.name}</h3>
                        {service.priceCents > 0 ? (
                          <span 
                            className="text-xl font-bold px-4 py-1.5 rounded-full text-white"
                            style={{ 
                              background: `linear-gradient(135deg, ${business.primaryColor || '#3b82f6'}, ${business.secondaryColor || '#d946ef'})`,
                            }}
                          >
                            ₪{(service.priceCents / 100).toFixed(0)}
                          </span>
                        ) : service.priceCents === 0 ? (
                          <span 
                            className="text-lg font-bold px-4 py-1.5 rounded-full text-white bg-green-500"
                          >
                            חינם
                          </span>
                        ) : null}
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <div 
                          className="flex items-center gap-1 font-medium"
                          style={{ color: business.primaryColor || '#3b82f6' }}
                        >
                          <Clock className="w-4 h-4" />
                          <span>{service.durationMin} דקות</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${business.primaryColor || '#3b82f6'}, ${business.secondaryColor || '#d946ef'})`,
              }}
            >
              <Calendar className="w-6 h-6" />
              קביעת תור
            </button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              מופעל על ידי <span className="font-semibold" style={{ color: business.primaryColor || '#3b82f6' }}>Clickinder</span>
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
            className="fixed top-4 left-4 z-50 p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
            style={{
              backgroundColor: business.secondaryColor || '#d946ef',
            }}
            aria-label="סגור"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          {/* Header */}
          <div 
            className="sticky top-0 z-40 backdrop-blur-lg shadow-md py-4 px-4"
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

