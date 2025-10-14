import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CardSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function SubscriptionLoading() {
  return (
    <div>
      <DashboardHeader
        title="חבילה ומנוי"
        subtitle="טוען..."
      />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="space-y-8">
          <CardSkeleton />
          
          <div>
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>

          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

