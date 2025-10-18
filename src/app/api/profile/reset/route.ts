/**
 * Profile Reset API - מחיקת כל הנתונים
 * POST /api/profile/reset
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    const userId = session.user.id;

    // מחיקת כל הנתונים של המשתמש
    await prisma.$transaction(async (tx) => {
      // שלב 1: מוצא את העסק של המשתמש
      const business = await tx.business.findFirst({
        where: { ownerUserId: userId },
        select: { id: true },
      });

      if (!business) {
        throw new Error('Business not found');
      }

      const businessId = business.id;

      // שלב 2: מחיקת כל הנתונים הקשורים לעסק
      // מחיקת התראות דשבורד
      await tx.dashboardNotification.deleteMany({
        where: { businessId },
      });

      // מחיקת בקשות לעריכת תורים
      await tx.pendingAppointmentEdit.deleteMany({
        where: {
          appointment: {
            businessId,
          },
        },
      });

      // מחיקת אישורי הגעה
      await tx.appointmentConfirmation.deleteMany({
        where: {
          appointment: {
            businessId,
          },
        },
      });

      // מחיקת תורים
      await tx.appointment.deleteMany({
        where: { businessId },
      });

      // מחיקת לקוחות
      await tx.customer.deleteMany({
        where: { businessId },
      });

      // מחיקת תבניות התראות
      await tx.notificationTemplate.deleteMany({
        where: { businessId },
      });

      // מחיקת עובדים
      await tx.staff.deleteMany({
        where: { businessId },
      });

      // מחיקת שירותים
      await tx.service.deleteMany({
        where: { businessId },
      });

      // מחיקת סניפים
      await tx.branch.deleteMany({
        where: { businessId },
      });

      // שלב 3: יצירת נתונים התחלתיים מחדש (כמו ברישום)
      
      // יצירת סניף ברירת מחדל
      const defaultBranch = await tx.branch.create({
        data: {
          businessId,
          name: 'סניף ראשי',
          address: '',
          isDefault: true,
        },
      });

      // יצירת עובד ראשון (המשתמש עצמו)
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      const defaultStaff = await tx.staff.create({
        data: {
          businessId,
          name: user?.name || 'עובד ראשון',
          phone: '',
          email: '',
        },
      });

      // יצירת שירות כללי
      await tx.service.create({
        data: {
          businessId,
          name: 'שירות כללי',
          description: 'שירות בסיסי',
          durationMin: 60,
          priceCents: 10000, // 100 ILS
        },
      });

      // יצירת תבניות התראות בסיסיות
      const notificationTemplates = [
        // WhatsApp
        {
          businessId,
          channel: 'whatsapp' as const,
          event: 'appointment_confirmed' as const,
          subject: 'אישור תור',
          body: 'שלום {{customerName}},\n\nהתור שלך אושר בהצלחה!\n\nפרטי התור:\n📅 תאריך: {{date}}\n🕐 שעה: {{time}}\n✂️ שירות: {{serviceName}}\n👤 מטפל: {{staffName}}\n📍 סניף: {{branchName}}\n\nמצפים לראותך!',
          isActive: true,
        },
        {
          businessId,
          channel: 'whatsapp' as const,
          event: 'appointment_reminder' as const,
          subject: 'תזכורת לתור',
          body: 'שלום {{customerName}},\n\nזוהי תזכורת לתור שלך מחר:\n\n📅 תאריך: {{date}}\n🕐 שעה: {{time}}\n✂️ שירות: {{serviceName}}\n\nמצפים לראותך!',
          isActive: true,
        },
        {
          businessId,
          channel: 'whatsapp' as const,
          event: 'appointment_canceled' as const,
          subject: 'ביטול תור',
          body: 'שלום {{customerName}},\n\nהתור שלך בתאריך {{date}} בשעה {{time}} בוטל בהצלחה.\n\nתודה!',
          isActive: true,
        },
        // Email
        {
          businessId,
          channel: 'email' as const,
          event: 'appointment_confirmed' as const,
          subject: 'אישור תור - {{businessName}}',
          body: 'שלום {{customerName}},\n\nהתור שלך אושר בהצלחה!\n\nפרטי התור:\nתאריך: {{date}}\nשעה: {{time}}\nשירות: {{serviceName}}\nמטפל: {{staffName}}\nסניף: {{branchName}}\n\nמצפים לראותך!',
          isActive: false,
        },
        {
          businessId,
          channel: 'email' as const,
          event: 'appointment_reminder' as const,
          subject: 'תזכורת לתור - {{businessName}}',
          body: 'שלום {{customerName}},\n\nזוהי תזכורת לתור שלך מחר:\n\nתאריך: {{date}}\nשעה: {{time}}\nשירות: {{serviceName}}\n\nמצפים לראותך!',
          isActive: false,
        },
        {
          businessId,
          channel: 'email' as const,
          event: 'appointment_canceled' as const,
          subject: 'ביטול תור - {{businessName}}',
          body: 'שלום {{customerName}},\n\nהתור שלך בתאריך {{date}} בשעה {{time}} בוטל בהצלחה.\n\nתודה!',
          isActive: false,
        },
      ];

      await tx.notificationTemplate.createMany({
        data: notificationTemplates,
      });
    });

    return NextResponse.json({ 
      message: 'כל הנתונים נמחקו והמערכת אופסה בהצלחה' 
    });
  } catch (error) {
    console.error('Error resetting profile data:', error);
    return NextResponse.json(
      { error: 'אירעה שגיאה באיפוס הנתונים' },
      { status: 500 }
    );
  }
}

