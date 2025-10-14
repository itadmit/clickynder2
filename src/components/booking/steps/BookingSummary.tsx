'use client';

import { useState } from 'react';
import { Business, Branch, Service, Staff, ServiceStaff } from '@prisma/client';
import { ArrowRight, Calendar, Clock, User, MapPin, Scissors, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

type StaffWithServices = Staff & {
  serviceStaff: (ServiceStaff & {
    service: Service;
  })[];
};

interface BookingSummaryProps {
  business: Business;
  bookingData: any;
  branches: Branch[];
  services: Service[];
  staff: StaffWithServices[];
  onConfirm: () => void;
  onBack: () => void;
}

export function BookingSummary({
  business,
  bookingData,
  branches,
  services,
  staff,
  onConfirm,
  onBack,
}: BookingSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const selectedBranch = branches.find((b) => b.id === bookingData.branchId);
  const selectedService = services.find((s) => s.id === bookingData.serviceId);
  const selectedStaff = staff.find((s) => s.id === bookingData.staffId);

  const handleConfirm = async () => {
    if (!agreedToTerms) {
      alert('יש לאשר את תנאי השימוש');
      return;
    }

    setIsSubmitting(true);
    await onConfirm();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">סיכום ההזמנה</h2>
      <p className="text-gray-600 text-sm mb-4">נא לוודא שהפרטים נכונים</p>

      <div className="space-y-2.5 mb-5">
        {/* Service */}
        {selectedService && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>שירות</span>
                </p>
                <p className="font-medium text-sm">{selectedService.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {selectedService.durationMin} דקות
                </p>
              </div>
              {selectedService.priceCents != null && selectedService.priceCents > 0 && (
                <p className="text-base font-bold text-primary-600">
                  {formatPrice(selectedService.priceCents, business.currency)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Staff */}
        {selectedStaff && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>עובד</span>
            </p>
            <p className="font-medium text-sm">{selectedStaff.name}</p>
          </div>
        )}

        {/* Branch */}
        {selectedBranch && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>סניף</span>
            </p>
            <p className="font-medium text-sm">{selectedBranch.name}</p>
            {selectedBranch.address && (
              <p className="text-xs text-gray-600 mt-0.5">{selectedBranch.address}</p>
            )}
          </div>
        )}

        {/* Date & Time */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>תאריך ושעה</span>
          </p>
          <div className="flex items-center gap-3">
            <p className="font-medium text-sm">{bookingData.date}</p>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <p className="font-medium text-sm">{bookingData.time}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">פרטי הלקוח</p>
          <div className="space-y-0.5">
            <p className="font-medium text-sm">{bookingData.customerName}</p>
            <p className="text-xs text-gray-600">{bookingData.customerPhone}</p>
            {bookingData.customerEmail && (
              <p className="text-xs text-gray-600">{bookingData.customerEmail}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        {bookingData.notes && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-0.5">הערות</p>
            <p className="text-xs">{bookingData.notes}</p>
          </div>
        )}
      </div>

      {/* Terms */}
      <div className="mb-4">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-xs text-gray-600">
            אני מאשר/ת את תנאי השימוש ומדיניות הפרטיות של העסק
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={isSubmitting || !agreedToTerms}
          className="btn btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>מאשר...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>אשר ותור</span>
            </>
          )}
        </button>

        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="btn btn-secondary flex items-center gap-2 text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          <span>חזרה</span>
        </button>
      </div>
    </div>
  );
}

