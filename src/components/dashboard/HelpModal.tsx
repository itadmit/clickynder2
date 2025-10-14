'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Mail, Phone, MessageCircle, ExternalLink } from 'lucide-react';

export function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setIsOpen(true);
    setIsOpening(true);
    setTimeout(() => {
      setIsOpening(false);
    }, 50);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Expose open function through custom event
  useEffect(() => {
    const handleOpenHelp = () => handleOpen();
    window.addEventListener('openHelp', handleOpenHelp);
    return () => window.removeEventListener('openHelp', handleOpenHelp);
  }, []);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
            isClosing ? 'opacity-0' : isOpening ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleClose}
        />
      )}

      {/* Off-canvas Panel */}
      {isOpen && (
        <div
          className={`fixed top-0 left-0 h-screen w-[calc(100%-50px)] sm:w-96 bg-white shadow-2xl z-[70] flex flex-col transition-transform duration-300 ease-out ${
            isClosing ? '-translate-x-full' : isOpening ? '-translate-x-full' : 'translate-x-0'
          }`}
          ref={modalRef}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-primary-50">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">עזרה ותמיכה</h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="סגור"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Welcome Message */}
              <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-4 rounded-lg border border-primary-200">
                <h4 className="font-bold text-gray-900 mb-2">👋 שלום!</h4>
                <p className="text-sm text-gray-700">
                  אנחנו כאן כדי לעזור לך. בחר את אחת מדרכי ההתקשרות למטה ונשמח לסייע.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3">דרכי התקשרות</h4>

                {/* Email */}
                <a
                  href="mailto:support@clickinder.co.il"
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">אימייל</h5>
                    <p className="text-sm text-gray-600 mb-2">שלח לנו הודעה ונחזור אליך בהקדם</p>
                    <p className="text-sm text-primary-600 font-medium">support@clickinder.co.il</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </a>

                {/* Phone */}
                <a
                  href="tel:+972501234567"
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">טלפון</h5>
                    <p className="text-sm text-gray-600 mb-2">שירות לקוחות זמין בימים א-ה 9:00-18:00</p>
                    <p className="text-sm text-green-600 font-medium">050-123-4567</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/972501234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">WhatsApp</h5>
                    <p className="text-sm text-gray-600 mb-2">שלח הודעה בוואטסאפ לתמיכה מהירה</p>
                    <p className="text-sm text-green-600 font-medium">050-123-4567</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </a>
              </div>

              {/* FAQ Link */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">משאבים נוספים</h4>
                <a
                  href="https://help.clickinder.co.il"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">מרכז עזרה ושאלות נפוצות</span>
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </a>
              </div>

              {/* Response Time */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  <strong>זמן מענה:</strong> אנו משתדלים לענות תוך 24 שעות בימי עסקים.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


