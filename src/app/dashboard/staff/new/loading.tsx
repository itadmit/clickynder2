import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FormPageSkeleton } from '@/components/ui/Skeleton';

export default function NewStaffLoading() {
  return (
    <div>
      <DashboardHeader
        title="הוספת עובד חדש"
        subtitle="טוען..."
      />
      <FormPageSkeleton />
    </div>
  );
}

