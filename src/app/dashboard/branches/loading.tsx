import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ListPageSkeleton } from '@/components/ui/Skeleton';

export default function BranchesLoading() {
  return (
    <div>
      <DashboardHeader
        title="סניפים"
        subtitle="טוען..."
      />
      <ListPageSkeleton />
    </div>
  );
}

