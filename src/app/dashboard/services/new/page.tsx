import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ServiceForm } from '@/components/services/ServiceForm';
import { redirect } from 'next/navigation';

export default async function NewServicePage() {
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
        title="הוספת שירות חדש"
        subtitle="הוסף שירות חדש שהעסק שלך מציע"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <ServiceForm
            businessId={business.id}
            categories={categories}
            staff={staff}
          />
        </div>
      </div>
    </div>
  );
}

