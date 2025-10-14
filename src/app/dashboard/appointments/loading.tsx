import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function AppointmentsLoading() {
  return (
    <div>
      <DashboardHeader
        title="תורים"
        subtitle="טוען..."
      />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header Actions Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>

        {/* Calendar Skeleton */}
        <div className="mb-8">
          <div className="card">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>

        {/* Today's Appointments Skeleton */}
        <CardSkeleton />
      </div>
    </div>
  );
}

