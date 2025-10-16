/**
 * User Registration API
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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

      await prisma.notificationTemplate.createMany({
        data: whatsappTemplates,
      });
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

