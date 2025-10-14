import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CardSkeleton, Skeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function CustomerDetailLoading() {
  return (
    <div>
      <DashboardHeader
        title="פרטי לקוח"
        subtitle="טוען..."
      />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Customer Info Skeleton */}
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>

          {/* Appointments Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

