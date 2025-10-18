import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { BusinessSettings } from '@/components/settings/BusinessSettings';
import { BookingPageDesign } from '@/components/settings/BookingPageDesign';
import { ContactSettings } from '@/components/settings/ContactSettings';
import { WorkingHours } from '@/components/settings/WorkingHours';
import { SlotSettings } from '@/components/settings/SlotSettings';
import { ReminderSettings } from '@/components/settings/ReminderSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { HolidaysSettings } from '@/components/settings/HolidaysSettings';

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
        <SettingsTabs>
          {/* Tab 1: General Settings */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">הגדרות כלליות</h2>
            <BusinessSettings business={business} />
          </div>

          {/* Tab 2: Booking Page Design */}
          <BookingPageDesign business={business} />

          {/* Tab 3: Contact & Social */}
          <ContactSettings business={business} />

          {/* Tab 3: Working Hours */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-6">ימי ושעות עבודה</h2>
              <WorkingHours
                businessId={business.id}
                businessHours={business.businessHours}
              />
            </div>

            {/* Holidays */}
            <HolidaysSettings businessId={business.id} />
          </div>

          {/* Tab 4: Slot Policy */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">הגדרות זמני פגישות</h2>
            <SlotSettings
              businessId={business.id}
              slotPolicy={business.slotPolicy}
            />
          </div>

          {/* Tab 5: Reminder Settings */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">תזכורות ואישורי הגעה</h2>
            <ReminderSettings
              businessId={business.id}
              initialSettings={{
                reminderEnabled: business.reminderEnabled,
                reminderHoursBefore: business.reminderHoursBefore,
                confirmationEnabled: business.confirmationEnabled,
                confirmationHoursBefore: business.confirmationHoursBefore,
              }}
            />
          </div>

          {/* Tab 6: Notification Templates */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">תבניות התראות</h2>
            <NotificationSettings
              businessId={business.id}
              templates={notificationTemplates}
            />
          </div>
        </SettingsTabs>
      </div>
    </div>
  );
}

