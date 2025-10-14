import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ServicesList } from '@/components/services/ServicesList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function ServicesPage() {
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

  const services = await prisma.service.findMany({
    where: {
      businessId: business.id,
      deletedAt: null,
    },
    include: {
      category: true,
      serviceStaff: {
        include: {
          staff: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const categories = await prisma.serviceCategory.findMany({
    where: {
      businessId: business.id,
    },
    orderBy: {
      position: 'asc',
    },
  });

  return (
    <div>
      <DashboardHeader
        title="שירותים"
        subtitle="נהל את השירותים שהעסק שלך מציע"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              סה"כ {services.length} שירותים
            </p>
          </div>
          <Link
            href="/dashboard/services/new"
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>הוספת שירות חדש</span>
          </Link>
        </div>

        {/* Services List */}
        <ServicesList
          services={services}
          categories={categories}
          businessId={business.id}
          currency={business.currency}
        />
      </div>
    </div>
  );
}

