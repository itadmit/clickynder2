'use client';

import { useState } from 'react';
import { Business, Branch, Service, Staff, ServiceCategory, ServiceStaff } from '@prisma/client';
import { StepIndicator } from './StepIndicator';
import { BranchSelection } from './steps/BranchSelection';
import { ServiceSelection } from './steps/ServiceSelection';
import { StaffSelection } from './steps/StaffSelection';
import { DateTimeSelection } from './steps/DateTimeSelection';
import { CustomerForm } from './steps/CustomerForm';
import { BookingSummary } from './steps/BookingSummary';
import { SuccessScreen } from './steps/SuccessScreen';

export type ServiceWithCategory = Service & {
  category: ServiceCategory | null;
};

export type StaffWithServices = Staff & {
  serviceStaff: (ServiceStaff & {
    service: Service;
  })[];
};

interface BookingFlowProps {
  business: Business;
  branches: Branch[];
  services: ServiceWithCategory[];
  staff: StaffWithServices[];
  onBookingSuccess?: () => void;
  initialStaffId?: string;
}

type BookingStep = 
  | 'branch' 
  | 'service' 
  | 'staff' 
  | 'datetime' 
  | 'customer' 
  | 'summary' 
  | 'success';

interface BookingData {
  branchId?: string;
  serviceId?: string;
  staffId?: string;
  date?: string;
  time?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  confirmationCode?: string;
}

export function BookingFlow({ business, branches, services, staff, onBookingSuccess, initialStaffId }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>(
    branches.length > 1 ? 'branch' : 'service'
  );
  const [bookingData, setBookingData] = useState<BookingData>(
    initialStaffId ? { staffId: initialStaffId } : {}
  );

  const steps: BookingStep[] = [
    ...(branches.length > 1 ? ['branch' as const] : []),
    'service',
    'staff',
    'datetime',
    'customer',
    'summary',
  ];

  const currentStepIndex = steps.indexOf(currentStep);

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  if (currentStep === 'success') {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <SuccessScreen
          business={business}
          bookingData={bookingData}
          branches={branches}
          services={services}
          staff={staff}
          onBookAnother={() => {
            setBookingData({});
            setCurrentStep(branches.length > 1 ? 'branch' : 'service');
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Step Indicator */}
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        completedSteps={steps.slice(0, currentStepIndex)}
      />

      {/* Step Content */}
      <div className="mt-8 card animate-slide-up">
        {currentStep === 'branch' && (
          <BranchSelection
            branches={branches}
            selectedBranchId={bookingData.branchId}
            onSelect={(branchId) => {
              updateBookingData({ branchId });
              goToNextStep();
            }}
          />
        )}

        {currentStep === 'service' && (
          <ServiceSelection
            services={services}
            selectedServiceId={bookingData.serviceId}
            onSelect={(serviceId) => {
              updateBookingData({ serviceId });
              goToNextStep();
            }}
            onBack={branches.length > 1 ? goToPreviousStep : undefined}
            currency={business.currency}
          />
        )}

        {currentStep === 'staff' && (
          <StaffSelection
            staff={staff.filter((s) => {
              // אם לא נבחר שירות, הצג את כל העובדים
              if (!bookingData.serviceId) return true;
              
              // אם לעובד אין שירותים משויכים, הצג אותו (במקרה של יצירה אוטומטית)
              if (!s.serviceStaff || s.serviceStaff.length === 0) return true;
              
              // אחרת, הצג רק אם העובד משויך לשירות שנבחר
              return s.serviceStaff.some((ss) => ss.serviceId === bookingData.serviceId);
            })}
            selectedStaffId={bookingData.staffId}
            onSelect={(staffId) => {
              updateBookingData({ staffId });
              goToNextStep();
            }}
            onBack={goToPreviousStep}
            onSkip={() => {
              updateBookingData({ staffId: undefined });
              goToNextStep();
            }}
          />
        )}

        {currentStep === 'datetime' && (
          <DateTimeSelection
            businessId={business.id}
            branchId={bookingData.branchId}
            serviceId={bookingData.serviceId!}
            staffId={bookingData.staffId}
            serviceDurationMin={services.find(s => s.id === bookingData.serviceId)?.durationMin}
            onSelect={(date, time) => {
              updateBookingData({ date, time });
              goToNextStep();
            }}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 'customer' && (
          <CustomerForm
            initialData={{
              name: bookingData.customerName,
              phone: bookingData.customerPhone,
              email: bookingData.customerEmail,
              notes: bookingData.notes,
            }}
            onSubmit={(data) => {
              updateBookingData({
                customerName: data.name,
                customerPhone: data.phone,
                customerEmail: data.email,
                notes: data.notes,
              });
              goToNextStep();
            }}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 'summary' && (
          <BookingSummary
            business={business}
            bookingData={bookingData}
            branches={branches}
            services={services}
            staff={staff}
            onConfirm={async () => {
              // Create appointment
              const response = await fetch('/api/appointments/book', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  businessId: business.id,
                  ...bookingData,
                }),
              });

              if (response.ok) {
                const result = await response.json();
                updateBookingData({ confirmationCode: result.confirmationCode });
                setCurrentStep('success');
                onBookingSuccess?.();
              }
            }}
            onBack={goToPreviousStep}
          />
        )}
      </div>
    </div>
  );
}

