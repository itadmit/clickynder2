import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ListPageSkeleton } from '@/components/ui/Skeleton';

export default function StaffLoading() {
  return (
    <div>
      <DashboardHeader
        title="עובדים"
        subtitle="טוען..."
      />
      <ListPageSkeleton />
    </div>
  );
}

