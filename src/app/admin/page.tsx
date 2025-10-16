import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // בדיקה אם המשתמש הוא Super Admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true },
  });

  if (!user?.isSuperAdmin) {
    redirect('/dashboard');
  }

  // שליפת כל המשתמשים והעסקים
  const users = await prisma.user.findMany({
    include: {
      ownedBusinesses: {
        include: {
          subscription: {
            include: {
              package: true,
            },
          },
          appointments: {
            select: {
              id: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // שליפת הגדרות מערכת
  const systemSettings = await prisma.systemSettings.findMany();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard 
        users={users} 
        systemSettings={systemSettings}
      />
    </div>
  );
}

