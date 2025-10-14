import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { BranchesList } from '@/components/branches/BranchesList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function BranchesPage() {
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

  const branches = await prisma.branch.findMany({
    where: {
      businessId: business.id,
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          staff: {
            where: {
              active: true,
              deletedAt: null,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Check package limits
  const maxBranches = business.subscription?.package.maxBranches || 1;
  const canAddMore = branches.length < maxBranches;

  return (
    <div>
      <DashboardHeader
        title="סניפים"
        subtitle="נהל את המיקומים השונים של העסק שלך"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              {branches.length} מתוך {maxBranches} סניפים
            </p>
          </div>
          {canAddMore ? (
            <Link
              href="/dashboard/branches/new"
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>הוספת סניף חדש</span>
            </Link>
          ) : (
            <div className="text-sm text-gray-500">
              הגעת למכסת הסניפים בחבילה שלך.{' '}
              <Link href="/dashboard/subscription" className="text-primary-600 hover:underline">
                שדרג חבילה
              </Link>
            </div>
          )}
        </div>

        {/* Branches List */}
        <BranchesList branches={branches} businessId={business.id} />
      </div>
    </div>
  );
}

