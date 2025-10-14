import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function SettingsLoading() {
  return (
    <div>
      <DashboardHeader
        title="הגדרות"
        subtitle="טוען..."
      />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="space-y-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

