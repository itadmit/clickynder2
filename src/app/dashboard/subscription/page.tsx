import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { PackageComparison } from '@/components/subscription/PackageComparison';
import { Check } from 'lucide-react';

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const business = await prisma.business.findFirst({
    where: {
      ownerUserId: session.user.id,
    },
    include: {
      subscription: {
        include: {
          package: true,
        },
      },
    },
  });

  if (!business) {
    return <div>לא נמצא עסק</div>;
  }

  // Get all packages
  const packages = await prisma.package.findMany({
    orderBy: {
      priceCents: 'asc',
    },
  });

  // Get usage for current period
  const currentDate = new Date();
  const periodMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  const usage = await prisma.usageCounter.findUnique({
    where: {
      businessId_periodMonth: {
        businessId: business.id,
        periodMonth,
      },
    },
  });

  return (
    <div>
      <DashboardHeader
        title="חבילה ומנוי"
        subtitle="נהל את המנוי והחבילה שלך"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Current Subscription */}
          {business.subscription && (
            <SubscriptionCard
              subscription={business.subscription}
              usage={usage}
              business={business}
            />
          )}

          {/* Package Comparison */}
          <div>
            <h2 className="text-2xl font-bold mb-6">בחר את החבילה המתאימה לך</h2>
            <PackageComparison
              packages={packages}
              currentPackageId={business.subscription?.packageId}
            />
          </div>

          {/* Features Matrix */}
          <div className="card">
            <h3 className="text-xl font-bold mb-6">השוואת תכונות</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4">תכונה</th>
                    {packages.map((pkg) => (
                      <th key={pkg.id} className="text-center py-3 px-4">
                        {pkg.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">עובדים</td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="text-center py-3 px-4">
                        {pkg.maxStaff === 999 ? 'ללא הגבלה' : pkg.maxStaff}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">סניפים</td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="text-center py-3 px-4">
                        {pkg.maxBranches === 999 ? 'ללא הגבלה' : pkg.maxBranches}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">תורים בחודש</td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="text-center py-3 px-4">
                        {pkg.monthlyAppointmentsCap === 999999
                          ? 'ללא הגבלה'
                          : pkg.monthlyAppointmentsCap}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">התראות WhatsApp</td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="text-center py-3 px-4">
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">אינטגרציות יומן</td>
                    {packages.map((pkg, index) => (
                      <td key={pkg.id} className="text-center py-3 px-4">
                        {index > 0 ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

