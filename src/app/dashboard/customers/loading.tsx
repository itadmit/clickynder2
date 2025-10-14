import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Skeleton, CardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function CustomersLoading() {
  return (
    <div>
      <DashboardHeader
        title="לקוחות"
        subtitle="טוען..."
      />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Search Bar Skeleton */}
        <div className="card mb-6">
          <div className="flex gap-4">
            <Skeleton className="flex-1 h-10 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>

        {/* List Skeleton */}
        <div className="card">
          <Skeleton className="h-5 w-32 mb-4" />
          <TableSkeleton rows={8} />
        </div>
      </div>
    </div>
  );
}

