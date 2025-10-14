import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ProfileLoading() {
  return (
    <div>
      <DashboardHeader title="פרופיל משתמש" />
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="card p-6">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-32 mt-6" />
        </div>
      </div>
    </div>
  );
}


