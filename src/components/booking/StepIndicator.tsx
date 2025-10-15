'use client';

import { Check } from 'lucide-react';

type BookingStep = 'branch' | 'service' | 'staff' | 'datetime' | 'customer' | 'summary' | 'success';

interface StepIndicatorProps {
  steps: BookingStep[];
  currentStep: BookingStep;
  completedSteps: BookingStep[];
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

const stepLabels: Record<BookingStep, string> = {
  branch: 'בחירת סניף',
  service: 'בחירת שירות',
  staff: 'בחירת עובד',
  datetime: 'תאריך ושעה',
  customer: 'פרטים אישיים',
  summary: 'סיכום',
  success: 'הושלם',
};

export function StepIndicator({ steps, currentStep, completedSteps, primaryColor, secondaryColor }: StepIndicatorProps) {
  const activeColor = primaryColor || '#3b82f6';
  const completedColor = secondaryColor || primaryColor || '#d946ef';
  
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 right-0 left-0 h-1 bg-gray-300" style={{ zIndex: 0 }}>
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${(completedSteps.length / (steps.length - 1)) * 100}%`,
              background: `linear-gradient(to left, ${activeColor}, ${completedColor})`,
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;

          return (
            <div key={step} className="flex flex-col items-center relative" style={{ zIndex: 1 }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 border-4 border-white shadow-lg"
                style={{
                  backgroundColor: isCurrent ? activeColor : isCompleted ? completedColor : '#e5e7eb',
                  color: isCompleted || isCurrent ? 'white' : '#6b7280',
                  boxShadow: isCurrent ? `0 0 0 4px ${activeColor}1a` : undefined,
                }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className="mt-2 text-xs font-medium"
                style={{
                  color: isCurrent ? activeColor : isCompleted ? completedColor : '#6b7280'
                }}
              >
                {stepLabels[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

