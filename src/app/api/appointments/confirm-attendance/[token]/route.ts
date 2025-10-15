import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { action } = await req.json(); // 'confirm' or 'cancel'

    // מצא את בקשת האישור
    const confirmation = await prisma.appointmentConfirmation.findUnique({
      where: { confirmationToken: params.token },
      include: {
        appointment: {
          include: {
            customer: true,
            service: true,
            staff: true,
            branch: true,
            business: true,
          },
        },
      },
    });

    if (!confirmation) {
      return NextResponse.json(
        { error: 'בקשת אישור לא נמצאה' },
        { status: 404 }
      );
    }

    // בדוק אם פג תוקף
    if (new Date() > confirmation.expiresAt) {
      await prisma.appointmentConfirmation.update({
        where: { id: confirmation.id },
        data: { status: 'expired' },
      });
      return NextResponse.json(
        { error: 'בקשת האישור פגת תוקף' },
        { status: 410 }
      );
    }

    // בדוק אם כבר טופל
    if (confirmation.status !== 'pending') {
      return NextResponse.json(
        { error: 'בקשת האישור כבר טופלה' },
        { status: 400 }
      );
    }

    if (action === 'confirm') {
      // אישור הגעה
      await prisma.appointmentConfirmation.update({
        where: { id: confirmation.id },
        data: {
          status: 'confirmed',
          confirmedAt: new Date(),
        },
      });

      // צור התראה לעסק
      await prisma.dashboardNotification.create({
        data: {
          businessId: confirmation.appointment.businessId,
          appointmentId: confirmation.appointment.id,
          customerId: confirmation.appointment.customerId,
          type: 'appointment_confirmed',
          title: '✅ לקוח אישר הגעה',
          message: `${confirmation.appointment.customer.firstName} ${confirmation.appointment.customer.lastName} אישר/ה הגעה לתור ב-${confirmation.appointment.startAt.toLocaleDateString('he-IL')}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'תודה! אישרת את הגעתך לתור',
        appointment: {
          date: confirmation.appointment.startAt,
          serviceName: confirmation.appointment.service.name,
          businessName: confirmation.appointment.business.name,
        },
      });
    } else if (action === 'cancel') {
      // ביטול התור
      await prisma.$transaction([
        // עדכון סטטוס האישור
        prisma.appointmentConfirmation.update({
          where: { id: confirmation.id },
          data: {
            status: 'canceled',
            canceledAt: new Date(),
          },
        }),
        // ביטול התור עצמו
        prisma.appointment.update({
          where: { id: confirmation.appointment.id },
          data: {
            status: 'canceled',
            canceledAt: new Date(),
          },
        }),
        // התראה לעסק
        prisma.dashboardNotification.create({
          data: {
            businessId: confirmation.appointment.businessId,
            appointmentId: confirmation.appointment.id,
            customerId: confirmation.appointment.customerId,
            type: 'appointment_canceled',
            title: '❌ לקוח ביטל תור',
            message: `${confirmation.appointment.customer.firstName} ${confirmation.appointment.customer.lastName} ביטל/ה תור ל-${confirmation.appointment.startAt.toLocaleDateString('he-IL')}`,
          },
        }),
      ]);

      // TODO: שלח הודעת ביטול ללקוח

      return NextResponse.json({
        success: true,
        message: 'התור בוטל בהצלחה',
      });
    }

    return NextResponse.json({ error: 'פעולה לא חוקית' }, { status: 400 });
  } catch (error) {
    console.error('Error handling attendance confirmation:', error);
    return NextResponse.json(
      { error: 'שגיאה בעיבוד הבקשה' },
      { status: 500 }
    );
  }
}

