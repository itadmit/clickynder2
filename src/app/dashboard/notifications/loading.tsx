import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Skeleton } from '@/components/ui/Skeleton';

export default function NotificationsLoading() {
  return (
    <div>
      <DashboardHeader title="התראות" />
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="card p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 mb-6 last:mb-0">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


