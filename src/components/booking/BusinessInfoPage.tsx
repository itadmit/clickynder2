'use client';

import { Business, Branch, Service, Staff, BusinessHours, ServiceCategory } from '@prisma/client';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import type { StaffWithServices } from './BookingFlow';

interface BusinessInfoPageProps {
  business: Business & {
    branches: Branch[];
    services: (Service & { category: ServiceCategory | null })[];
    staff: StaffWithServices[];
    businessHours: BusinessHours[];
  };
}

export function BusinessInfoPage({ business }: BusinessInfoPageProps) {
  // Select template based on business.templateStyle
  const templateStyle = business.templateStyle || 'modern';

  switch (templateStyle) {
    case 'classic':
      return <ClassicTemplate business={business} />;
    case 'minimal':
      return <MinimalTemplate business={business} />;
    case 'modern':
    default:
      return <ModernTemplate business={business} />;
  }
}
