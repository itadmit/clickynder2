import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { BusinessSettings } from '@/components/settings/BusinessSettings';
import { WorkingHours } from '@/components/settings/WorkingHours';
import { SlotSettings } from '@/components/settings/SlotSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const business = await prisma.business.findFirst({
    where: {
      ownerUserId: session.user.id,
    },
    include: {
      businessHours: {
        orderBy: {
          weekday: 'asc',
        },
      },
      slotPolicy: true,
    },
  });

  if (!business) {
    return <div>לא נמצא עסק</div>;
  }

  const notificationTemplates = await prisma.notificationTemplate.findMany({
    where: {
      businessId: business.id,
    },
  });

  return (
    <div>
      <DashboardHeader
        title="הגדרות"
        subtitle="נהל את הגדרות העסק והמערכת"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Business Settings */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">הגדרות כלליות</h2>
            <BusinessSettings business={business} />
          </div>

          {/* Working Hours */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">ימי ושעות עבודה</h2>
            <WorkingHours
              businessId={business.id}
              businessHours={business.businessHours}
            />
          </div>

          {/* Slot Policy */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">הגדרות זמני פגישות</h2>
            <SlotSettings
              businessId={business.id}
              slotPolicy={business.slotPolicy}
            />
          </div>

          {/* Notification Settings */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">התראות והודעות</h2>
            <NotificationSettings
              businessId={business.id}
              templates={notificationTemplates}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

