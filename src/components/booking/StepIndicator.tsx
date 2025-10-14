'use client';

import { Check } from 'lucide-react';

type BookingStep = 'branch' | 'service' | 'staff' | 'datetime' | 'customer' | 'summary' | 'success';

interface StepIndicatorProps {
  steps: BookingStep[];
  currentStep: BookingStep;
  completedSteps: BookingStep[];
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

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 right-0 left-0 h-1 bg-gray-300" style={{ zIndex: 0 }}>
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{
              width: `${(completedSteps.length / (steps.length - 1)) * 100}%`,
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
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-300 border-4 border-white
                  ${
                    isCompleted
                      ? 'bg-blue-500 text-white shadow-md'
                      : isCurrent
                      ? 'bg-blue-500 text-white ring-4 ring-blue-100 shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium
                  ${isCurrent ? 'text-blue-600' : 'text-gray-600'}
                `}
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

