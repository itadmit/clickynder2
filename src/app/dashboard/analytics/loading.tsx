import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatCardSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function AnalyticsLoading() {
  return (
    <div>
      <DashboardHeader
        title="סטטיסטיקות ואנליטיקס"
        subtitle="טוען..."
      />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

