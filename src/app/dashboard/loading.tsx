import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div>
      <DashboardHeader
        title="טוען..."
        subtitle="אנא המתן"
      />
      <DashboardSkeleton />
    </div>
  );
}

