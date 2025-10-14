import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FormPageSkeleton } from '@/components/ui/Skeleton';

export default function NewServiceLoading() {
  return (
    <div>
      <DashboardHeader
        title="הוספת שירות חדש"
        subtitle="טוען..."
      />
      <FormPageSkeleton />
    </div>
  );
}

