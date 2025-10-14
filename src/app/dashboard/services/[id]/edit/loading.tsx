import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EditServiceLoading() {
  return (
    <div>
      <DashboardHeader
        title="עריכת שירות"
        subtitle="טוען..."
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <div className="card">
            <div className="space-y-6">
              {/* Service Name */}
              <div>
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Category */}
              <div>
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Duration and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Buffer After */}
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-64 mt-1" />
              </div>

              {/* Description */}
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-24 w-full" />
              </div>

              {/* Color */}
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </div>

              {/* Staff */}
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


