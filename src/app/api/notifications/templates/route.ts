import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationChannel, NotificationEvent } from '@prisma/client';

// תבניות ברירת מחדל WhatsApp (פעילות)
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
📍 סניף: {branch_name}
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
📍 סניף: {branch_name}

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
📍 סניף: {branch_name}

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
📍 סניף: {branch_name}

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
📍 סניף: {branch_name}

{business_name}`,
  },
  {
    channel: 'whatsapp' as NotificationChannel,
    event: 'appointment_edit_request' as NotificationEvent,
    subject: null,
    body: `היי {customer_name}! 📝

יש לנו בקשה לשינוי בתור שלך:

🔴 מועד ישן:
📅 {old_date}
🕒 {old_time}

🟢 מועד חדש מוצע:
📅 {new_date}
🕒 {new_time}
💈 שירות: {service_name}
👤 מטפל/ת: {staff_name}
📍 סניף: {branch_name}

⏰ לחץ על הקישור לאישור או דחיה:
{confirmation_link}

{business_name}`,
  },
  {
    channel: 'whatsapp' as NotificationChannel,
    event: 'appointment_confirmation' as NotificationEvent,
    subject: null,
    body: `היי {customer_name}! 👋

נשמח לאשר איתך שאתה מגיע לתור:

📅 תאריך: {appointment_date}
🕒 שעה: {appointment_time}
💈 שירות: {service_name}
👤 מטפל/ת: {staff_name}
📍 סניף: {branch_name}

✅ מאשר הגעה? לחץ כאן:
{confirm_link}

❌ צריך לבטל? לחץ כאן:
{cancel_link}

תודה!
{business_name}`,
  },
];

// תבניות ברירת מחדל Email (לא פעילות)
const DEFAULT_EMAIL_TEMPLATES = [
  {
    channel: 'email' as NotificationChannel,
    event: 'booking_confirmed' as NotificationEvent,
    subject: 'אישור תור - {business_name}',
    body: `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">✅ התור אושר בהצלחה!</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 18px; color: #333;">שלום <strong>{customer_name}</strong>,</p>
      <p style="font-size: 16px; color: #666; line-height: 1.6;">התור שלך אושר בהצלחה! נשמח לראותך.</p>
      
      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">פרטי התור:</h2>
        <p style="margin: 10px 0; font-size: 16px;"><strong>📅 תאריך:</strong> {appointment_date}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>🕒 שעה:</strong> {appointment_time}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>💈 שירות:</strong> {service_name}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>👤 מטפל/ת:</strong> {staff_name}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>📍 סניף:</strong> {branch_name}</p>
      </div>
      
      <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        {business_name}<br/>
        הודעה זו נשלחה אוטומטית, אין צורך להשיב
      </p>
    </div>
  </div>
</body>
</html>`,
  },
  {
    channel: 'email' as NotificationChannel,
    event: 'booking_reminder' as NotificationEvent,
    subject: '🔔 תזכורת לתור מחר - {business_name}',
    body: `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🔔 תזכורת לתור</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 18px; color: #333;">היי <strong>{customer_name}</strong>,</p>
      <p style="font-size: 16px; color: #666; line-height: 1.6;">רצינו להזכיר לך שיש לך תור מחר!</p>
      
      <div style="background: #fff3cd; border-right: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h2 style="color: #856404; margin-top: 0; font-size: 20px;">פרטי התור:</h2>
        <p style="margin: 10px 0; font-size: 16px; color: #856404;"><strong>📅 תאריך:</strong> {appointment_date}</p>
        <p style="margin: 10px 0; font-size: 16px; color: #856404;"><strong>🕒 שעה:</strong> {appointment_time}</p>
        <p style="margin: 10px 0; font-size: 16px; color: #856404;"><strong>💈 שירות:</strong> {service_name}</p>
        <p style="margin: 10px 0; font-size: 16px; color: #856404;"><strong>👤 מטפל/ת:</strong> {staff_name}</p>
      </div>
      
      <p style="font-size: 16px; color: #666; text-align: center;">נתראה מחר! 😊</p>
      
      <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        {business_name}<br/>
        הודעה זו נשלחה אוטומטית, אין צורך להשיב
      </p>
    </div>
  </div>
</body>
</html>`,
  },
  {
    channel: 'email' as NotificationChannel,
    event: 'booking_canceled' as NotificationEvent,
    subject: 'ביטול תור - {business_name}',
    body: `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #868f96 0%, #596164 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">ביטול תור</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 18px; color: #333;">שלום <strong>{customer_name}</strong>,</p>
      <p style="font-size: 16px; color: #666; line-height: 1.6;">התור שלך בוטל בהצלחה.</p>
      
      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="color: #868f96; margin-top: 0; font-size: 20px;">פרטי התור שבוטל:</h2>
        <p style="margin: 10px 0; font-size: 16px;"><strong>📅 תאריך:</strong> {appointment_date}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>🕒 שעה:</strong> {appointment_time}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>💈 שירות:</strong> {service_name}</p>
      </div>
      
      <p style="font-size: 16px; color: #666; text-align: center;">אנחנו כאן אם תרצה לקבוע תור חדש 😊</p>
      
      <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        {business_name}<br/>
        הודעה זו נשלחה אוטומטית, אין צורך להשיב
      </p>
    </div>
  </div>
</body>
</html>`,
  },
  {
    channel: 'email' as NotificationChannel,
    event: 'booking_rescheduled' as NotificationEvent,
    subject: 'שינוי מועד תור - {business_name}',
    body: `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">📅 התור עודכן!</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 18px; color: #333;">שלום <strong>{customer_name}</strong>,</p>
      <p style="font-size: 16px; color: #666; line-height: 1.6;">התור שלך עודכן בהצלחה למועד חדש.</p>
      
      <div style="background: #d1ecf1; border-right: 4px solid #0c5460; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h2 style="color: #0c5460; margin-top: 0; font-size: 20px;">המועד החדש:</h2>
        <p style="margin: 10px 0; font-size: 16px; color: #0c5460;"><strong>📅 תאריך:</strong> {appointment_date}</p>
        <p style="margin: 10px 0; font-size: 16px; color: #0c5460;"><strong>🕒 שעה:</strong> {appointment_time}</p>
        <p style="margin: 10px 0; font-size: 16px; color: #0c5460;"><strong>💈 שירות:</strong> {service_name}</p>
        <p style="margin: 10px 0; font-size: 16px; color: #0c5460;"><strong>👤 מטפל/ת:</strong> {staff_name}</p>
      </div>
      
      <p style="font-size: 16px; color: #666; text-align: center;">נתראה במועד החדש! 🙂</p>
      
      <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        {business_name}<br/>
        הודעה זו נשלחה אוטומטית, אין צורך להשיב
      </p>
    </div>
  </div>
</body>
</html>`,
  },
  {
    channel: 'email' as NotificationChannel,
    event: 'admin_new_booking' as NotificationEvent,
    subject: '🔔 תור חדש התקבל - {business_name}',
    body: `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🔔 תור חדש!</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 18px; color: #333;">התקבל תור חדש במערכת:</p>
      
      <div style="background: #d4edda; border-right: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h2 style="color: #155724; margin-top: 0; font-size: 20px;">פרטי התור:</h2>
        <p style="margin: 10px 0; font-size: 16px; color: #155724;"><strong>👤 לקוח:</strong> {customer_name}</p>
        <p style="margin: 10px 0; font-size: 16px; color: #155724;"><strong>📅 תאריך:</strong> {appointment_date}</p>
        <p style="margin: 10px 0; font-size: 16px; color: #155724;"><strong>🕒 שעה:</strong> {appointment_time}</p>
        <p style="margin: 10px 0; font-size: 16px; color: #155724;"><strong>💈 שירות:</strong> {service_name}</p>
        <p style="margin: 10px 0; font-size: 16px; color: #155724;"><strong>👨‍💼 מטפל/ת:</strong> {staff_name}</p>
      </div>
      
      <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        {business_name}<br/>
        התחבר למערכת לניהול התור
      </p>
    </div>
  </div>
</body>
</html>`,
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

    // צור תבניות WhatsApp + Email ברירת מחדל
    const allTemplates = [
      ...DEFAULT_WHATSAPP_TEMPLATES.map(t => ({ ...t, active: true })),
      ...DEFAULT_EMAIL_TEMPLATES.map(t => ({ ...t, active: false })),
    ];

    const createdTemplates = await prisma.$transaction(
      allTemplates.map((template) =>
        prisma.notificationTemplate.create({
          data: {
            businessId,
            channel: template.channel,
            event: template.event,
            subject: template.subject,
            body: template.body,
            active: template.active,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      count: createdTemplates.length,
      templates: createdTemplates,
      message: `נוצרו ${createdTemplates.length} תבניות (WhatsApp + Email) בהצלחה`,
    });
  } catch (error) {
    console.error('Error creating default templates:', error);
    return NextResponse.json(
      { error: 'Failed to create templates' },
      { status: 500 }
    );
  }
}

