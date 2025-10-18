'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Users, Scissors, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface OnboardingTourProps {
  businessSlug: string;
  staffCount: number;
  servicesCount: number;
}

interface Step {
  title: string;
  description: string;
  icon: any;
  color: string;
  link?: string;
  linkText?: string;
}

export function OnboardingTour({ businessSlug, staffCount, servicesCount }: OnboardingTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: 'ברוכים הבאים ל-Clickynder',
      description: 'כדי לעזור לך להתחיל, כבר הכנו עבורך את הבסיס. בואו נסייר ביחד ונראה מה מוכן.',
      icon: Sparkles,
      color: 'bg-gradient-to-br from-[#dbeafe] to-[#f5ebff]',
    },
    {
      title: 'העובד הראשון שלך',
      description: `יצרנו עבורך עובד ראשון בשם שלך. אתה יכול לערוך את הפרטים, להוסיף תמונה, ולהגדיר את שעות העבודה שלך. ${staffCount > 0 ? 'העובד כבר זמין במערכת.' : ''}`,
      icon: Users,
      color: 'bg-gradient-to-br from-[#dbeafe] to-[#f5ebff]',
      link: '/dashboard/staff',
      linkText: 'לצפייה בעובדים',
    },
    {
      title: 'שירות כללי נוצר עבורך',
      description: `יצרנו עבורך שירות בסיסי בשם "שירות כללי" (מחיר: ₪100, משך: 60 דקות). אתה יכול לערוך אותו, לשנות את המחיר והזמן, או להוסיף שירותים נוספים. ${servicesCount > 0 ? 'השירות כבר זמין במערכת.' : ''}`,
      icon: Scissors,
      color: 'bg-gradient-to-br from-[#dbeafe] to-[#f5ebff]',
      link: '/dashboard/services',
      linkText: 'לעריכת שירותים',
    },
    {
      title: 'עמוד התורים',
      description: 'בעמוד התורים תראה את כל התורים שנקבעו. לקוחות יכולים לקבוע תורים דרך הלינק הציבורי שלך, וגם אתה יכול ליצור תורים חדשים ידנית.',
      icon: Calendar,
      color: 'bg-gradient-to-br from-[#dbeafe] to-[#f5ebff]',
      link: '/dashboard/appointments',
      linkText: 'לצפייה בתורים',
    },
    {
      title: 'מוכן להתחיל',
      description: `הלינק הציבורי שלך מוכן: clickynder.com/${businessSlug}\n\nשתף אותו עם הלקוחות שלך ותתחיל לקבל הזמנות.`,
      icon: Check,
      color: 'bg-gradient-to-br from-[#dbeafe] to-[#f5ebff]',
    },
  ];

  // Initialize tour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    if (!hasSeenTour) {
      setIsOpen(true);
    }
  }, []);

  // Highlight sidebar item based on current step
  useEffect(() => {
    if (!isOpen) return; // Don't highlight if tour is not open
    
    const currentStepData = steps[currentStep];
    console.log('Current step:', currentStep, 'Link:', currentStepData?.link); // Debug
    
    if (currentStepData?.link) {
      // Dispatch custom event to highlight sidebar item
      window.dispatchEvent(
        new CustomEvent('highlightSidebarItem', {
          detail: { path: currentStepData.link }
        })
      );
    } else {
      // Clear highlight if no link
      window.dispatchEvent(
        new CustomEvent('highlightSidebarItem', {
          detail: { path: null }
        })
      );
    }

    // Cleanup on unmount or step change
    return () => {
      window.dispatchEvent(
        new CustomEvent('highlightSidebarItem', {
          detail: { path: null }
        })
      );
    };
  }, [currentStep, isOpen, steps]);

  const handleClose = () => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
    // Clear highlight
    window.dispatchEvent(
      new CustomEvent('highlightSidebarItem', {
        detail: { path: null }
      })
    );
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className={`${currentStepData.color} p-6 md:p-8 relative border-b border-gray-200`}>
          <button
            onClick={handleSkip}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="סגור"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <Icon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-semibold mb-1 text-gray-900">
                {currentStepData.title}
              </h2>
              <p className="text-sm text-gray-600">
                שלב {currentStep + 1} מתוך {steps.length}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line mb-6">
            {currentStepData.description}
          </p>

          {/* Link button if exists */}
          {currentStepData.link && currentStepData.linkText && (
            <Link
              href={currentStepData.link}
              onClick={handleClose}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center mb-4"
            >
              {currentStepData.linkText} →
            </Link>
          )}

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-blue-600'
                    : index < currentStep
                    ? 'w-2 bg-green-500'
                    : 'w-2 bg-gray-300'
                }`}
                aria-label={`עבור לשלב ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                קודם
              </button>
            )}
            
            <button
              onClick={handleNext}
              className={`flex-1 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isLastStep
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLastStep ? (
                <>
                  <Check className="w-5 h-5" />
                  התחל עכשיו
                </>
              ) : (
                <>
                  הבא
                  <ArrowLeft className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Skip button */}
          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
            >
              דלג על ההדרכה
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

