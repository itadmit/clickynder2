import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FormPageSkeleton } from '@/components/ui/Skeleton';

export default function NewAppointmentLoading() {
  return (
    <div>
      <DashboardHeader
        title="יצירת תור חדש"
        subtitle="טוען..."
      />
      <FormPageSkeleton />
    </div>
  );
}

