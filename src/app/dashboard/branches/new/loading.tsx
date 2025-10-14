import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FormPageSkeleton } from '@/components/ui/Skeleton';

export default function NewBranchLoading() {
  return (
    <div>
      <DashboardHeader
        title="הוספת סניף חדש"
        subtitle="טוען..."
      />
      <FormPageSkeleton />
    </div>
  );
}

