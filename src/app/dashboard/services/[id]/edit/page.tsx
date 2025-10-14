import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ServiceForm } from '@/components/services/ServiceForm';
import { redirect, notFound } from 'next/navigation';

interface EditServicePageProps {
  params: {
    id: string;
  };
}

export default async function EditServicePage({ params }: EditServicePageProps) {
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

  // Fetch the service
  const service = await prisma.service.findFirst({
    where: {
      id: params.id,
      businessId: business.id,
      deletedAt: null,
    },
    include: {
      serviceStaff: {
        select: {
          staffId: true,
        },
      },
    },
  });

  if (!service) {
    notFound();
  }

  const categories = await prisma.serviceCategory.findMany({
    where: {
      businessId: business.id,
    },
    orderBy: {
      position: 'asc',
    },
  });

  const staff = await prisma.staff.findMany({
    where: {
      businessId: business.id,
      active: true,
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div>
      <DashboardHeader
        title="עריכת שירות"
        subtitle={`עריכת ${service.name}`}
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <ServiceForm
            businessId={business.id}
            categories={categories}
            staff={staff}
            service={service}
          />
        </div>
      </div>
    </div>
  );
}


