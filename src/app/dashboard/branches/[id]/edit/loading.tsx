import { Skeleton } from '@/components/ui/Skeleton';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function Loading() {
  return (
    <div>
      <DashboardHeader
        title="עריכת סניף"
        subtitle="טוען..."
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <div className="card">
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

