'use client';

import { useEffect } from 'react';
import { Business, Branch, Service, Staff } from '@prisma/client';
import { Calendar, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SuccessScreenProps {
  business: Business;
  bookingData: any;
  branches: Branch[];
  services: Service[];
  staff: Staff[];
  onBookAnother: () => void;
}

export function SuccessScreen({ business, bookingData, branches, services, staff, onBookAnother }: SuccessScreenProps) {
  useEffect(() => {
    // Confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleAddToCalendar = () => {
    alert('הוספה ליומן - בקרוב!');
  };

  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Get selected items
  const selectedBranch = branches.find(b => b.id === bookingData.branchId);
  const selectedService = services.find(s => s.id === bookingData.serviceId);
  const selectedStaff = staff.find(s => s.id === bookingData.staffId);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 animate-fade-in">
      {/* Wave Background - Right Top Corner - Larger & Higher */}
      <div className="absolute top-0 right-0 w-2/3 h-96 overflow-hidden pointer-events-none opacity-10">
        <svg className="absolute top-0 right-0 w-full h-full" viewBox="0 0 197 185" preserveAspectRatio="xMaxYMin meet">
          <path d="M12.56 7C3.2 29.507 5.659 52.521 19.935 76.04c21.415 35.28 72.198 12.72 96.058 58.974C131.898 165.849 158.9 182.51 197 185V7H12.56z" fill="#6366f1" />
        </svg>
      </div>

      {/* Business Name Header - Transparent */}
      <div 
        className="z-10 backdrop-blur-lg text-white py-4 text-center sticky top-0 shadow-md"
        style={{ 
          backgroundColor: business.primaryColor ? `${business.primaryColor}B3` : '#3b82f6B3'
        }}
      >
        <h1 className="text-lg font-semibold">{business.name}</h1>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full py-6 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-200px)] flex flex-col">
        {/* Desktop: 2 Columns, Mobile: 1 Column */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-stretch flex-1">
          
          {/* Right Column - Illustration */}
          <div className="text-center flex items-center justify-center order-2 lg:order-1">
            <img 
              src="/assets/success-illustration.svg" 
              alt="Success" 
              className="w-full max-w-sm sm:max-w-md lg:max-w-full mx-auto h-auto lg:h-full object-contain"
            />
          </div>

          {/* Left Column - Details */}
          <div className="text-center lg:text-right space-y-4 sm:space-y-6 flex flex-col justify-center order-1 lg:order-2">
            {/* Title */}
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gray-800">התור נקבע בהצלחה!</h2>
              
              {/* Confirmation Code */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">מספר אישור</p>
                <div className="inline-block bg-white rounded-xl px-6 sm:px-8 py-3 sm:py-4 shadow-lg">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-600 tracking-wider">
                    {bookingData.confirmationCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-lg shadow-xl p-5 sm:p-6 lg:p-8 text-right">
              <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 text-gray-800">פרטי התור שלך</h3>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                {selectedService && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-500">שירות</span>
                    <span className="text-gray-800 font-semibold">{selectedService.name}</span>
                  </div>
                )}
                {selectedStaff && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-500">עובד</span>
                    <span className="text-gray-800 font-semibold">{selectedStaff.name}</span>
                  </div>
                )}
                {selectedBranch && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-500">סניף</span>
                    <span className="text-gray-800 font-semibold">{selectedBranch.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500">תאריך ושעה</span>
                  <span className="text-gray-800 font-semibold">
                    {formatDate(bookingData.date)} בשעה {bookingData.time}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500">לקוח</span>
                  <span className="text-gray-800 font-semibold">{bookingData.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">טלפון</span>
                  <span className="text-gray-800 font-semibold">{bookingData.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-md">
              <p className="text-sm text-indigo-700">
                ✓ הודעת אישור נשלחה אליך ב-SMS{bookingData.customerEmail && ' ובאימייל'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onBookAnother}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg transition-all"
              >
                קבע תור נוסף
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCalendar}
                  className="bg-white hover:bg-gray-50 text-indigo-600 font-medium py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>הוסף ליומן</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="bg-white hover:bg-gray-50 text-indigo-600 font-medium py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>הדפס</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer - Clickinder Credit */}
        <div className="mt-8 text-center py-4">
          <p className="text-sm text-gray-600">
            מופעל על ידי <span className="font-semibold text-indigo-600">Clickinder</span>
          </p>
        </div>
      </div>
    </div>
  );
}

