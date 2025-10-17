/**
 * User Registration API
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendEmail } from '@/lib/notifications/email-service';

const registerSchema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
  phone: z.string().min(9, 'מספר טלפון לא תקין'),
  businessSlug: z.string()
    .min(3, 'כתובת אתר חייבת להכיל לפחות 3 תווים')
    .regex(/^[a-z0-9-]+$/, 'כתובת אתר יכולה להכיל רק אותיות אנגליות קטנות, מספרים ומקפים'),
  businessAddress: z.string().min(5, 'כתובת העסק חייבת להכיל לפחות 5 תווים'),
  city: z.string().min(2, 'שם העיר חייב להכיל לפחות 2 תווים'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // ולידציה
    const validatedData = registerSchema.parse(body);

    // בדיקה אם המשתמש כבר קיים
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'משתמש עם אימייל זה כבר קיים' },
        { status: 400 }
      );
    }

    // הצפנת סיסמה
    const passwordHash = await hash(validatedData.password, 12);

    // בדיקה אם ה-slug כבר קיים
    const existingBusiness = await prisma.business.findUnique({
      where: { slug: validatedData.businessSlug },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { error: 'כתובת האתר הזאת כבר תפוסה. אנא בחר כתובת אחרת' },
        { status: 400 }
      );
    }

    // יצירת משתמש ועסק בטרנזקציה
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        passwordHash,
        ownedBusinesses: {
          create: {
            name: validatedData.city, // שם העיר כשם העסק
            slug: validatedData.businessSlug,
            address: validatedData.businessAddress,
            phone: validatedData.phone, // טלפון מפרטי המשתמש
            email: validatedData.email, // אימייל מפרטי המשתמש
            timezone: 'Asia/Jerusalem',
            locale: 'he-IL',
            showStaff: true,
            showBranches: false,
            onlinePaymentEnabled: false,
            templateStyle: 'modern',
            primaryColor: '#3b82f6',
            secondaryColor: '#d946ef',
            backgroundColorStart: '#dbeafe',
            backgroundColorEnd: '#faf5ff',
            font: 'Noto Sans Hebrew',
          },
        },
      },
      include: {
        ownedBusinesses: true,
      },
    });

    // יצירת חבילת Starter כברירת מחדל
    const starterPackage = await prisma.package.findUnique({
      where: { code: 'starter' },
    });

    if (starterPackage && user.ownedBusinesses[0]) {
      await prisma.subscription.create({
        data: {
          businessId: user.ownedBusinesses[0].id,
          packageId: starterPackage.id,
          status: 'trial',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        },
      });

      // יצירת SlotPolicy ברירת מחדל
      await prisma.slotPolicy.create({
        data: {
          businessId: user.ownedBusinesses[0].id,
          defaultDurationMin: 30,
          defaultGapMin: 0,
          advanceWindowDays: 30,
          sameDayBooking: true,
          roundingStrategy: 'continuous',
        },
      });

      // יצירת BusinessHours ברירת מחדל (ראשון-חמישי 8:00-17:00)
      const businessHours = [];
      for (let day = 0; day <= 4; day++) {
        businessHours.push({
          businessId: user.ownedBusinesses[0].id,
          weekday: day,
          openTime: '08:00',
          closeTime: '17:00',
          active: true,
        });
      }
      // שישי וש בת סגורים
      businessHours.push({
        businessId: user.ownedBusinesses[0].id,
        weekday: 5,
        openTime: null,
        closeTime: null,
        active: false,
      });
      businessHours.push({
        businessId: user.ownedBusinesses[0].id,
        weekday: 6,
        openTime: null,
        closeTime: null,
        active: false,
      });

      await prisma.businessHours.createMany({
        data: businessHours,
      });

      // יצירת סניף ראשון
      const branch = await prisma.branch.create({
        data: {
          businessId: user.ownedBusinesses[0].id,
          name: validatedData.city,
          address: validatedData.businessAddress,
          phone: validatedData.phone || null,
          active: true,
        },
      });

      // יצירת עובד ראשון - בעל העסק עצמו
      const staff = await prisma.staff.create({
        data: {
          businessId: user.ownedBusinesses[0].id,
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          roleLabel: 'בעלים',
          active: true,
          calendarColor: '#0584c7', // הצבע שביקשת
        },
      });

      // יצירת שירות ברירת מחדל "כללי"
      const service = await prisma.service.create({
        data: {
          businessId: user.ownedBusinesses[0].id,
          name: 'כללי',
          durationMin: 30, // 30 דקות כמו בדוגמה שהראת
          priceCents: 9900, // 99 ש"ח
          bufferAfterMin: 0,
          active: true,
          color: '#0584c7', // אותו צבע
        },
      });

      // חיבור העובד לשירות
      await prisma.serviceStaff.create({
        data: {
          serviceId: service.id,
          staffId: staff.id,
        },
      });

      // יצירת תבניות WhatsApp ברירת מחדל
      const whatsappTemplates = [
        {
          businessId: user.ownedBusinesses[0].id,
          channel: 'whatsapp' as const,
          event: 'booking_confirmed' as const,
          subject: null,
          body: `שלום {customer_name}! 👋

התור שלך אושר בהצלחה! 🎉

📅 תאריך: {appointment_date}
🕒 שעה: {appointment_time}
💈 שירות: {service_name}
👤 מטפל/ת: {staff_name}
🏢 {business_name}

נשמח לראותך! 😊`,
          active: true,
        },
        {
          businessId: user.ownedBusinesses[0].id,
          channel: 'whatsapp' as const,
          event: 'booking_reminder' as const,
          subject: null,
          body: `היי {customer_name}! 🔔

תזכורת: יש לך תור מחר!

📅 תאריך: {appointment_date}
🕒 שעה: {appointment_time}
💈 שירות: {service_name}
👤 מטפל/ת: {staff_name}

נתראה! 🙂
{business_name}`,
          active: true,
        },
        {
          businessId: user.ownedBusinesses[0].id,
          channel: 'whatsapp' as const,
          event: 'booking_canceled' as const,
          subject: null,
          body: `שלום {customer_name},

התור שלך בוטל בהצלחה.

📅 תאריך שבוטל: {appointment_date}
🕒 שעה: {appointment_time}
💈 שירות: {service_name}

אנחנו כאן אם תרצה לקבוע תור חדש 😊

{business_name}`,
          active: true,
        },
        {
          businessId: user.ownedBusinesses[0].id,
          channel: 'whatsapp' as const,
          event: 'booking_rescheduled' as const,
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
          active: true,
        },
        {
          businessId: user.ownedBusinesses[0].id,
          channel: 'whatsapp' as const,
          event: 'admin_new_booking' as const,
          subject: null,
          body: `🔔 תור חדש התקבל!

👤 לקוח: {customer_name}
📅 תאריך: {appointment_date}
🕒 שעה: {appointment_time}
💈 שירות: {service_name}
👨‍💼 מטפל/ת: {staff_name}

{business_name}`,
          active: true,
        },
        {
          businessId: user.ownedBusinesses[0].id,
          channel: 'whatsapp' as const,
          event: 'appointment_edit_request' as const,
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

⏰ לחץ על הקישור לאישור או דחיה:
{confirmation_link}

{business_name}`,
          active: true,
        },
      ];

      // יצירת תבניות Email ברירת מחדל (לא פעילות)
      const emailTemplates = [
        {
          businessId: user.ownedBusinesses[0].id,
          channel: 'email' as const,
          event: 'booking_confirmed' as const,
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
          active: false, // לא פעיל כברירת מחדל
        },
        {
          businessId: user.ownedBusinesses[0].id,
          channel: 'email' as const,
          event: 'booking_reminder' as const,
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
          active: false,
        },
        {
          businessId: user.ownedBusinesses[0].id,
          channel: 'email' as const,
          event: 'booking_canceled' as const,
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
          active: false,
        },
        {
          businessId: user.ownedBusinesses[0].id,
          channel: 'email' as const,
          event: 'booking_rescheduled' as const,
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
          active: false,
        },
        {
          businessId: user.ownedBusinesses[0].id,
          channel: 'email' as const,
          event: 'admin_new_booking' as const,
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
          active: false,
        },
      ];

      // יצירת כל התבניות (WhatsApp + Email)
      await prisma.notificationTemplate.createMany({
        data: [...whatsappTemplates, ...emailTemplates],
      });
    }

    // שליחת מייל ברוכים הבאים עם פרטי התחברות
    try {
      const dashboardUrl = `${process.env.NEXTAUTH_URL || 'https://clickynder.co.il'}/dashboard`;
      const bookingUrl = `${process.env.NEXTAUTH_URL || 'https://clickynder.co.il'}/${validatedData.businessSlug}`;
      const loginUrl = `${process.env.NEXTAUTH_URL || 'https://clickynder.co.il'}/auth/signin`;
      
      const welcomeEmailHtml = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ברוכים הבאים ל-Clickynder</title>
</head>
<body style="font-family: 'Noto Sans Hebrew', 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-top: 20px; margin-bottom: 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🎉 ברוכים הבאים!</h1>
      <p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 18px;">החשבון שלך נוצר בהצלחה</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 18px; color: #333; margin-top: 0;">שלום <strong>${validatedData.name}</strong>,</p>
      <p style="font-size: 16px; color: #666; line-height: 1.7;">תודה שהצטרפת ל-Clickynder! אנחנו שמחים שבחרת בנו לניהול התורים שלך.</p>

      <!-- Login Details Box -->
      <div style="background: linear-gradient(135deg, #f8f9fe 0%, #fff5ff 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-right: 4px solid #667eea;">
        <h2 style="color: #667eea; margin-top: 0; font-size: 20px; margin-bottom: 20px;">🔐 פרטי ההתחברות שלך:</h2>
        <div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 12px;">
          <p style="margin: 0; font-size: 14px; color: #666;">אימייל:</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; color: #333; font-weight: bold;">${validatedData.email}</p>
        </div>
        <div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 12px;">
          <p style="margin: 0; font-size: 14px; color: #666;">הסיסמה שבחרת:</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; color: #333; font-weight: bold; font-family: monospace;">${validatedData.password}</p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #999;">💡 שמור את הסיסמה במקום מאובטח</p>
        </div>
        <div style="background: white; border-radius: 8px; padding: 15px;">
          <p style="margin: 0; font-size: 14px; color: #666;">כתובת דף התורים שלך:</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; color: #667eea; font-weight: bold; word-break: break-all;">${bookingUrl}</p>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
          🚀 כניסה למערכת
        </a>
      </div>

      <!-- Mobile Apps Section -->
      <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 30px 0;">
        <h3 style="color: #333; margin-top: 0; font-size: 18px; text-align: center; margin-bottom: 20px;">📱 הורד את האפליקציה</h3>
        <p style="color: #666; font-size: 14px; text-align: center; margin-bottom: 20px;">נהל את התורים שלך בקלות מכל מקום</p>
        
        <div style="display: table; width: 100%; margin-top: 20px;">
          <!-- App Store -->
          <div style="display: table-cell; width: 50%; padding: 0 5px; text-align: center; vertical-align: top;">
            <a href="https://apps.apple.com/app/clickynder" style="display: inline-block; text-decoration: none;">
              <div style="background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 15px; transition: all 0.3s;">
                <div style="font-size: 32px; margin-bottom: 8px;">🍎</div>
                <div style="color: #333; font-size: 14px; font-weight: bold; margin-bottom: 4px;">App Store</div>
                <div style="color: #666; font-size: 12px;">עבור iPhone</div>
              </div>
            </a>
          </div>
          
          <!-- Google Play -->
          <div style="display: table-cell; width: 50%; padding: 0 5px; text-align: center; vertical-align: top;">
            <a href="https://play.google.com/store/apps/details?id=com.clickynder" style="display: inline-block; text-decoration: none;">
              <div style="background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 15px; transition: all 0.3s;">
                <div style="font-size: 32px; margin-bottom: 8px;">🤖</div>
                <div style="color: #333; font-size: 14px; font-weight: bold; margin-bottom: 4px;">Google Play</div>
                <div style="color: #666; font-size: 12px;">עבור Android</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Features List -->
      <div style="margin: 30px 0;">
        <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">✨ מה אפשר לעשות עכשיו?</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <span style="color: #667eea; font-size: 18px; margin-left: 10px;">⚙️</span>
            <span style="color: #666; font-size: 15px;">התאמה אישית של דף התורים</span>
          </li>
          <li style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <span style="color: #667eea; font-size: 18px; margin-left: 10px;">📋</span>
            <span style="color: #666; font-size: 15px;">הוספת שירותים ומחירים</span>
          </li>
          <li style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <span style="color: #667eea; font-size: 18px; margin-left: 10px;">👥</span>
            <span style="color: #666; font-size: 15px;">ניהול צוות העובדים</span>
          </li>
          <li style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <span style="color: #667eea; font-size: 18px; margin-left: 10px;">🔔</span>
            <span style="color: #666; font-size: 15px;">הגדרת תזכורות אוטומטיות</span>
          </li>
          <li style="padding: 12px 0;">
            <span style="color: #667eea; font-size: 18px; margin-left: 10px;">📊</span>
            <span style="color: #666; font-size: 15px;">מעקב אחר נתונים וסטטיסטיקות</span>
          </li>
        </ul>
      </div>

      <!-- Support Section -->
      <div style="background: #fff9e6; border-radius: 10px; padding: 20px; margin: 30px 0; border-right: 3px solid #ffd700;">
        <h3 style="color: #856404; margin-top: 0; font-size: 16px; margin-bottom: 10px;">💡 צריך עזרה?</h3>
        <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
          הצוות שלנו כאן לעזור! פנה אלינו בכל שאלה או בעיה והיינו שמחים לסייע.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #999; font-size: 13px; margin: 0 0 10px 0;">
        <strong style="color: #667eea; font-size: 16px;">Clickynder</strong><br/>
        מערכת ניהול תורים חכמה ופשוטה
      </p>
      <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
        הודעה זו נשלחה אוטומטית, אין צורך להשיב
      </p>
    </div>
  </div>
</body>
</html>`;

      await sendEmail({
        to: validatedData.email,
        subject: '🎉 ברוכים הבאים ל-Clickynder - החשבון שלך מוכן!',
        body: `שלום ${validatedData.name},

תודה שהצטרפת ל-Clickynder!

פרטי ההתחברות שלך:
אימייל: ${validatedData.email}
סיסמה: ${validatedData.password}
דף התורים שלך: ${bookingUrl}

כניסה למערכת: ${loginUrl}

הורד את האפליקציה:
🍎 App Store: https://apps.apple.com/app/clickynder
🤖 Google Play: https://play.google.com/store/apps/details?id=com.clickynder

⚠️ שמור את הסיסמה במקום מאובטח!

בברכה,
צוות Clickynder`,
        html: welcomeEmailHtml,
      });

      console.log('Welcome email sent to:', validatedData.email);
    } catch (emailError) {
      // לא נכשיל את הרישום אם המייל נכשל
      console.error('Failed to send welcome email:', emailError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      business: user.ownedBusinesses[0],
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'אירעה שגיאה ביצירת החשבון' },
      { status: 500 }
    );
  }
}

