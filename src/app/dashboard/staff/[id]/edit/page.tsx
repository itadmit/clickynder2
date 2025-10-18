import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StaffForm } from '@/components/staff/StaffForm';
import { redirect, notFound } from 'next/navigation';

interface EditStaffPageProps {
  params: {
    id: string;
  };
}

export default async function EditStaffPage({ params }: EditStaffPageProps) {
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

  // Fetch the staff member
  const staffMember = await prisma.staff.findFirst({
    where: {
      id: params.id,
      businessId: business.id,
      deletedAt: null,
    },
    include: {
      serviceStaff: {
        include: {
          service: true,
        },
      },
    },
  });

  if (!staffMember) {
    notFound();
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
        title="עריכת עובד"
        subtitle={`עריכת פרטי ${staffMember.name}`}
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <StaffForm
            businessId={business.id}
            branches={branches}
            services={services}
            staff={staffMember}
          />
        </div>
      </div>
    </div>
  );
}

