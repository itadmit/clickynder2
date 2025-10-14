import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { NotificationsList } from '@/components/dashboard/NotificationsList';

export default async function NotificationsPage() {
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
    redirect('/auth/signin');
  }

  // Get all notifications
  const notificationsData = await prisma.dashboardNotification.findMany({
    where: {
      businessId: business.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convert Date objects to ISO strings and null to undefined for client components
  const notifications = notificationsData.map(n => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
    appointmentId: n.appointmentId ?? undefined,
    customerId: n.customerId ?? undefined,
  }));

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <DashboardHeader
        title="התראות"
        subtitle={`${unreadCount} התראות חדשות`}
      />
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <NotificationsList notifications={notifications} />
      </div>
    </div>
  );
}


