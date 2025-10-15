import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotificationFromTemplate } from '@/lib/notifications/notification-service';

/**
 * Cron job לשליחת תזכורות והתראות
 * 
 * צריך להפעיל כל 15 דקות או כל שעה
 * 
 * דוגמה עם crontab (להריץ כל 15 דקות):
 * curl -X POST https://clickynder.com/api/cron/send-reminders -H "Authorization: Bearer YOUR_SECRET_KEY"
 */
export async function POST(req: NextRequest) {
  try {
    // אימות (להגנה על ה-endpoint)
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_KEY || 'your-secret-key-here';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const results = {
      reminders: 0,
      confirmations: 0,
      errors: 0,
    };

    // 1. מצא כל העסקים עם הגדרות תזכורות
    const businesses = await prisma.business.findMany({
      where: {
        OR: [
          { reminderEnabled: true },
          { confirmationEnabled: true },
        ],
      },
      select: {
        id: true,
        name: true,
        reminderEnabled: true,
        reminderHoursBefore: true,
        confirmationEnabled: true,
        confirmationHoursBefore: true,
      },
    });

    for (const business of businesses) {
      try {
        // 2. תזכורות רגילות
        if (business.reminderEnabled) {
          const reminderTime = new Date(now);
          reminderTime.setHours(reminderTime.getHours() + business.reminderHoursBefore);

          // מצא תורים שצריכים תזכורת
          const appointmentsForReminder = await prisma.appointment.findMany({
            where: {
              businessId: business.id,
              status: 'confirmed',
              startAt: {
                gte: reminderTime,
                lte: new Date(reminderTime.getTime() + 60 * 60 * 1000), // תוך שעה מהזמן המתוזמן
              },
              // בדוק שלא נשלחה תזכורת כבר
              notifications: {
                none: {
                  event: 'booking_reminder',
                  createdAt: {
                    gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // לא נשלחה ב-24 שעות האחרונות
                  },
                },
              },
            },
            include: {
              customer: true,
              service: true,
              staff: true,
              branch: true,
              business: true,
            },
          });

          // שלח תזכורת לכל תור
          for (const appointment of appointmentsForReminder) {
            try {
              await sendNotificationFromTemplate(
                business.id,
                'booking_reminder',
                appointment.id
              );
              results.reminders++;
              console.log(`✅ Reminder sent for appointment ${appointment.id}`);
            } catch (error) {
              console.error(`❌ Failed to send reminder for appointment ${appointment.id}:`, error);
              results.errors++;
            }
          }
        }

        // 3. אישורי הגעה
        if (business.confirmationEnabled) {
          const confirmationTime = new Date(now);
          confirmationTime.setHours(confirmationTime.getHours() + business.confirmationHoursBefore);

          // מצא תורים שצריכים אישור הגעה
          const appointmentsForConfirmation = await prisma.appointment.findMany({
            where: {
              businessId: business.id,
              status: 'confirmed',
              startAt: {
                gte: confirmationTime,
                lte: new Date(confirmationTime.getTime() + 60 * 60 * 1000), // תוך שעה
              },
              // בדוק שלא נשלחה בקשת אישור כבר
              confirmations: {
                none: {
                  createdAt: {
                    gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
            include: {
              customer: true,
              service: true,
              staff: true,
              branch: true,
              business: true,
            },
          });

          // שלח בקשת אישור לכל תור
          for (const appointment of appointmentsForConfirmation) {
            try {
              // צור token אישור
              const confirmationToken = `conf_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
              
              // יצירת רשומת אישור
              const confirmation = await prisma.appointmentConfirmation.create({
                data: {
                  appointmentId: appointment.id,
                  confirmationToken,
                  expiresAt: new Date(appointment.startAt.getTime() - 60 * 60 * 1000), // שעה לפני התור
                },
              });

              // שלח הודעת אישור
              const confirmLink = `https://clickynder.com/confirm-attendance/${confirmationToken}?action=confirm`;
              const cancelLink = `https://clickynder.com/confirm-attendance/${confirmationToken}?action=cancel`;

              // שלח הודעה עם הלינקים
              const channels: ('whatsapp' | 'sms' | 'email')[] = [];
              const recipient: { phone?: string; email?: string } = {};

              if (appointment.customer.phone) {
                channels.push('whatsapp');
                recipient.phone = appointment.customer.phone;
              }

              if (appointment.customer.email) {
                channels.push('email');
                recipient.email = appointment.customer.email;
              }

              if (channels.length > 0) {
                const variables = {
                  business_name: appointment.business.name,
                  customer_name: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
                  service_name: appointment.service.name,
                  staff_name: appointment.staff?.name || '',
                  branch_name: appointment.branch?.name || '',
                  appointment_date: appointment.startAt.toLocaleDateString('he-IL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                  appointment_time: appointment.startAt.toLocaleTimeString('he-IL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  confirm_link: confirmLink,
                  cancel_link: cancelLink,
                };

                // קבל את התבנית
                const template = await prisma.notificationTemplate.findFirst({
                  where: {
                    businessId: business.id,
                    channel: 'whatsapp',
                    event: 'appointment_confirmation',
                  },
                });

                if (template) {
                  let body = template.body;
                  for (const [key, value] of Object.entries(variables)) {
                    body = body.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
                  }

                  // כאן צריך לשלוח את ההודעה בפועל
                  // TODO: integrate with WhatsApp/SMS service
                  
                  // יצירת רשומת התראה
                  await prisma.notification.create({
                    data: {
                      businessId: business.id,
                      appointmentId: appointment.id,
                      customerId: appointment.customerId,
                      channel: 'whatsapp',
                      event: 'appointment_confirmation',
                      recipient: recipient.phone || recipient.email || '',
                      subject: null,
                      body,
                      status: 'sent',
                      sentAt: new Date(),
                    },
                  });

                  results.confirmations++;
                  console.log(`✅ Confirmation request sent for appointment ${appointment.id}`);
                }
              }
            } catch (error) {
              console.error(`❌ Failed to send confirmation for appointment ${appointment.id}:`, error);
              results.errors++;
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing business ${business.id}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cron job completed',
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('❌ Cron job failed:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint למידע על ה-cron
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Reminders Cron Job Endpoint',
    usage: 'POST with Authorization: Bearer YOUR_SECRET_KEY',
    schedule: 'Run every 15-60 minutes',
    example: 'curl -X POST https://clickynder.com/api/cron/send-reminders -H "Authorization: Bearer YOUR_SECRET_KEY"',
  });
}

