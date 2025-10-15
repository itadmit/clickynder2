import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, time, serviceId, staffId } = await req.json();

    // וידוא שהתור קיים ושייך לעסק של המשתמש
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        business: {
          OR: [
            { ownerUserId: session.user.id },
            {
              members: {
                some: {
                  userId: session.user.id,
                  role: { in: ['admin', 'manager'] },
                },
              },
            },
          ],
        },
      },
      include: {
        customer: true,
        service: true,
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // חישוב תאריך וזמן התחלה וסיום
    const [hours, minutes] = time.split(':');
    const startAt = new Date(date);
    startAt.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    // קבלת משך השירות החדש
    const newService = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { durationMin: true },
    });

    if (!newService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const endAt = new Date(startAt);
    endAt.setMinutes(endAt.getMinutes() + newService.durationMin);

    // יצירת טוקן אישור ייחודי
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    // יצירת בקשת עריכה ממתינה
    const pendingEdit = await prisma.pendingAppointmentEdit.create({
      data: {
        appointmentId: appointment.id,
        newStartAt: startAt,
        newEndAt: endAt,
        newServiceId: serviceId,
        newStaffId: staffId,
        confirmationToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ימים
      },
    });

    // יצירת לינק אישור קצר
    const confirmationLink = `https://clickynder.com/confirm-edit/${confirmationToken}`;

    // שליחת הודעה ללקוח עם בקשה לאישור
    await sendEditConfirmationNotification(appointment, pendingEdit, confirmationLink);

    return NextResponse.json({
      success: true,
      message: 'בקשת עריכה נשלחה ללקוח לאישור',
      confirmationLink,
    });
  } catch (error) {
    console.error('Error creating edit request:', error);
    return NextResponse.json(
      { error: 'Failed to create edit request' },
      { status: 500 }
    );
  }
}

async function sendEditConfirmationNotification(
  appointment: any,
  pendingEdit: any,
  confirmationLink: string
) {
  const { sendMultiChannelNotification } = await import('@/lib/notifications/notification-service');

  const newService = await prisma.service.findUnique({
    where: { id: pendingEdit.newServiceId },
    select: { name: true },
  });

  const newStaff = await prisma.staff.findUnique({
    where: { id: pendingEdit.newStaffId },
    select: { name: true },
  });

  const variables = {
    business_name: appointment.business.name,
    customer_name: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
    old_date: new Intl.DateTimeFormat('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(appointment.startAt)),
    old_time: new Intl.DateTimeFormat('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(appointment.startAt)),
    new_date: new Intl.DateTimeFormat('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(pendingEdit.newStartAt)),
    new_time: new Intl.DateTimeFormat('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(pendingEdit.newStartAt)),
    service_name: newService?.name || '',
    staff_name: newStaff?.name || '',
    confirmation_link: confirmationLink,
  };

  const channels: ('email' | 'whatsapp' | 'sms')[] = [];
  const recipient: { phone?: string; email?: string } = {};

  if (appointment.customer.phone) {
    channels.push('whatsapp');
    recipient.phone = appointment.customer.phone;
  }

  if (appointment.customer.email) {
    channels.push('email');
    recipient.email = appointment.customer.email;
  }

  await sendMultiChannelNotification(
    appointment.business.id,
    'appointment_edit_request',
    channels,
    recipient,
    variables,
    appointment.id,
    appointment.customer.id
  );
}

