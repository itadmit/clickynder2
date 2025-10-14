import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StaffForm } from '@/components/staff/StaffForm';
import { redirect } from 'next/navigation';

export default async function NewStaffPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const business = await prisma.business.findFirst({
    where: {
      ownerUserId: session.user.id,
    },
  });

  if (!business) {
    return <div>לא נמצא עסק</div>;
  }

  const branches = await prisma.branch.findMany({
    where: {
      businessId: business.id,
      deletedAt: null,
      active: true,
    },
  });

  const services = await prisma.service.findMany({
    where: {
      businessId: business.id,
      deletedAt: null,
      active: true,
    },
  });

  return (
    <div>
      <DashboardHeader
        title="הוספת עובד חדש"
        subtitle="הוסף עובד חדש לצוות שלך"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <StaffForm
            businessId={business.id}
            branches={branches}
            services={services}
          />
        </div>
      </div>
    </div>
  );
}

