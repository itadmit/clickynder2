'use client';

import { OnboardingTour } from './OnboardingTour';

interface DashboardClientProps {
  businessSlug: string;
  staffCount: number;
  servicesCount: number;
}

export function DashboardClient({ businessSlug, staffCount, servicesCount }: DashboardClientProps) {
  return (
    <OnboardingTour 
      businessSlug={businessSlug}
      staffCount={staffCount}
      servicesCount={servicesCount}
    />
  );
}

