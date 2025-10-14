import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StaffList } from '@/components/staff/StaffList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function StaffPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const business = await prisma.business.findFirst({
    where: {
      ownerUserId: session.user.id,
    },
  });

  if (!business) {
    return <div>לא נמצא עסק</div>;
  }

  const staff = await prisma.staff.findMany({
    where: {
      businessId: business.id,
      deletedAt: null,
    },
    include: {
      branch: true,
      serviceStaff: {
        include: {
          service: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const branches = await prisma.branch.findMany({
    where: {
      businessId: business.id,
      deletedAt: null,
      active: true,
    },
  });

  return (
    <>
      <DashboardHeader
        title="עובדים"
        subtitle="נהל את צוות העובדים שלך"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              סה"כ {staff.length} עובדים
            </p>
          </div>
          <Link
            href="/dashboard/staff/new"
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>הוספת עובד חדש</span>
          </Link>
        </div>

        {/* Staff List */}
        <StaffList staff={staff} branches={branches} businessId={business.id} />
      </div>
    </>
  );
}

