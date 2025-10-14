import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { BranchForm } from '@/components/branches/BranchForm';
import { redirect } from 'next/navigation';

export default async function NewBranchPage() {
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

  return (
    <div>
      <DashboardHeader
        title="הוספת סניף חדש"
        subtitle="הוסף מיקום חדש לעסק שלך"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <BranchForm businessId={business.id} />
        </div>
      </div>
    </div>
  );
}

