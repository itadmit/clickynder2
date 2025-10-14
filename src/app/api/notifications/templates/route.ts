import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationChannel, NotificationEvent } from '@prisma/client';

// תבניות ברירת מחדל - רק WhatsApp דרך RappelSend
const DEFAULT_WHATSAPP_TEMPLATES = [
  {
    channel: 'whatsapp' as NotificationChannel,
    event: 'booking_confirmed' as NotificationEvent,
    subject: null,
    body: `שלום {customer_name}! 👋

התור שלך אושר בהצלחה! 🎉

📅 תאריך: {appointment_date}
🕒 שעה: {appointment_time}
💈 שירות: {service_name}
👤 מטפל/ת: {staff_name}
🏢 {business_name}

נשמח לראותך! 😊`,
  },
  {
    channel: 'whatsapp' as NotificationChannel,
    event: 'booking_reminder' as NotificationEvent,
    subject: null,
    body: `היי {customer_name}! 🔔

תזכורת: יש לך תור מחר!

📅 תאריך: {appointment_date}
🕒 שעה: {appointment_time}
💈 שירות: {service_name}
👤 מטפל/ת: {staff_name}

נתראה! 🙂
{business_name}`,
  },
  {
    channel: 'whatsapp' as NotificationChannel,
    event: 'booking_canceled' as NotificationEvent,
    subject: null,
    body: `שלום {customer_name},

התור שלך בוטל בהצלחה.

📅 תאריך שבוטל: {appointment_date}
🕒 שעה: {appointment_time}
💈 שירות: {service_name}

אנחנו כאן אם תרצה לקבוע תור חדש 😊

{business_name}`,
  },
  {
    channel: 'whatsapp' as NotificationChannel,
    event: 'booking_rescheduled' as NotificationEvent,
    subject: null,
    body: `שלום {customer_name}! 📅

התור שלך עודכן בהצלחה!

מועד חדש:
📅 תאריך: {appointment_date}
🕒 שעה: {appointment_time}
💈 שירות: {service_name}
👤 מטפל/ת: {staff_name}

נתראה! 🙂
{business_name}`,
  },
  {
    channel: 'whatsapp' as NotificationChannel,
    event: 'admin_new_booking' as NotificationEvent,
    subject: null,
    body: `🔔 תור חדש התקבל!

👤 לקוח: {customer_name}
📅 תאריך: {appointment_date}
🕒 שעה: {appointment_time}
💈 שירות: {service_name}
👨‍💼 מטפל/ת: {staff_name}

{business_name}`,
  },
];

/**
 * GET - קבלת כל התבניות של העסק
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    // וודא שהעסק שייך למשתמש
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerUserId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const templates = await prisma.notificationTemplate.findMany({
      where: { businessId },
      orderBy: [
        { channel: 'asc' },
        { event: 'asc' },
      ],
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST - יצירת תבניות ברירת מחדל לעסק
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId } = await request.json();

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    // וודא שהעסק שייך למשתמש
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerUserId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // בדוק אם כבר קיימות תבניות
    const existingTemplates = await prisma.notificationTemplate.findMany({
      where: { businessId },
    });

    if (existingTemplates.length > 0) {
      return NextResponse.json(
        { error: 'Templates already exist for this business' },
        { status: 400 }
      );
    }

    // צור תבניות WhatsApp ברירת מחדל
    const createdTemplates = await prisma.$transaction(
      DEFAULT_WHATSAPP_TEMPLATES.map((template) =>
        prisma.notificationTemplate.create({
          data: {
            businessId,
            channel: template.channel,
            event: template.event,
            subject: template.subject,
            body: template.body,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      count: createdTemplates.length,
      templates: createdTemplates,
      message: 'נוצרו 5 תבניות WhatsApp בהצלחה',
    });
  } catch (error) {
    console.error('Error creating default templates:', error);
    return NextResponse.json(
      { error: 'Failed to create templates' },
      { status: 500 }
    );
  }
}

