import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CardSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function AppointmentDetailLoading() {
  return (
    <div>
      <DashboardHeader
        title="פרטי תור"
        subtitle="טוען..."
      />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          
          <div className="card">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-24 w-full rounded-lg mb-4" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>

          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

