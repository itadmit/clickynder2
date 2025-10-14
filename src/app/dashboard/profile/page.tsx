import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProfileSettings } from '@/components/profile/ProfileSettings';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div>
      <DashboardHeader
        title="פרופיל משתמש"
        subtitle="נהל את פרטי החשבון שלך"
      />
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <ProfileSettings user={user} />
      </div>
    </div>
  );
}


