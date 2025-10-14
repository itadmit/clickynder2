import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { BranchForm } from '@/components/branches/BranchForm';
import { redirect, notFound } from 'next/navigation';

interface EditBranchPageProps {
  params: {
    id: string;
  };
}

export default async function EditBranchPage({ params }: EditBranchPageProps) {
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

  const branch = await prisma.branch.findFirst({
    where: {
      id: params.id,
      businessId: business.id,
      deletedAt: null,
    },
  });

  if (!branch) {
    notFound();
  }

  return (
    <div>
      <DashboardHeader
        title="עריכת סניף"
        subtitle={`עריכת ${branch.name}`}
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <BranchForm businessId={business.id} branch={branch} businessAddress={business.address || undefined} />
        </div>
      </div>
    </div>
  );
}

