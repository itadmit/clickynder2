import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ListPageSkeleton } from '@/components/ui/Skeleton';

export default function ServicesLoading() {
  return (
    <div>
      <DashboardHeader
        title="שירותים"
        subtitle="טוען..."
      />
      <ListPageSkeleton />
    </div>
  );
}

