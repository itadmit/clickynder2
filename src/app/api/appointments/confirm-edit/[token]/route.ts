import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // מציאת בקשת עריכה ממתינה
    const pendingEdit = await prisma.pendingAppointmentEdit.findUnique({
      where: {
        confirmationToken: token,
      },
      include: {
        appointment: {
          include: {
            customer: true,
            service: true,
            staff: true,
            business: true,
          },
        },
      },
    });

    if (!pendingEdit) {
      return NextResponse.json(
        { error: 'Invalid confirmation token' },
        { status: 404 }
      );
    }

    // בדיקה שהבקשה לא פגה
    if (new Date() > pendingEdit.expiresAt) {
      await prisma.pendingAppointmentEdit.update({
        where: { id: pendingEdit.id },
        data: { status: 'expired' },
      });
      return NextResponse.json(
        { error: 'Confirmation link expired' },
        { status: 410 }
      );
    }

    // בדיקה שהבקשה עדיין ממתינה
    if (pendingEdit.status !== 'pending') {
      return NextResponse.json(
        { error: 'Edit request already processed' },
        { status: 400 }
      );
    }

    // עדכון התור
    const updatedAppointment = await prisma.appointment.update({
      where: { id: pendingEdit.appointmentId },
      data: {
        startAt: pendingEdit.newStartAt,
        endAt: pendingEdit.newEndAt,
        serviceId: pendingEdit.newServiceId,
        staffId: pendingEdit.newStaffId,
      },
      include: {
        customer: true,
        service: true,
        staff: true,
        business: true,
      },
    });

    // עדכון סטטוס הבקשה
    await prisma.pendingAppointmentEdit.update({
      where: { id: pendingEdit.id },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    });

    // שליחת הודעת אישור
    await sendEditConfirmedNotification(updatedAppointment);

    return NextResponse.json({
      success: true,
      message: 'התור עודכן בהצלחה!',
      appointment: {
        id: updatedAppointment.id,
        startAt: updatedAppointment.startAt,
        serviceName: updatedAppointment.service.name,
        staffName: updatedAppointment.staff?.name,
      },
    });
  } catch (error) {
    console.error('Error confirming edit:', error);
    return NextResponse.json(
      { error: 'Failed to confirm edit' },
      { status: 500 }
    );
  }
}

async function sendEditConfirmedNotification(appointment: any) {
  const { sendMultiChannelNotification } = await import('@/lib/notifications/notification-service');

  const variables = {
    business_name: appointment.business.name,
    customer_name: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
    appointment_date: new Intl.DateTimeFormat('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(appointment.startAt)),
    appointment_time: new Intl.DateTimeFormat('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(appointment.startAt)),
    service_name: appointment.service.name,
    staff_name: appointment.staff?.name || '',
    branch_name: appointment.branch?.name || '',
    confirmation_code: appointment.confirmationCode,
  };

  // שליחה ללקוח
  const customerChannels: ('email' | 'whatsapp' | 'sms')[] = [];
  const customerRecipient: { phone?: string; email?: string } = {};

  if (appointment.customer.phone) {
    customerChannels.push('whatsapp');
    customerRecipient.phone = appointment.customer.phone;
  }

  if (appointment.customer.email) {
    customerChannels.push('email');
    customerRecipient.email = appointment.customer.email;
  }

  if (customerChannels.length > 0) {
    await sendMultiChannelNotification(
      appointment.business.id,
      'booking_confirmed',
      customerChannels,
      customerRecipient,
      variables,
      appointment.id,
      appointment.customer.id
    );
  }

  // שליחה לעסק
  const businessChannels: ('email' | 'whatsapp' | 'sms')[] = [];
  const businessRecipient: { phone?: string; email?: string } = {};

  if (appointment.business.email) {
    businessChannels.push('email');
    businessRecipient.email = appointment.business.email;
  }

  if (appointment.business.phone) {
    businessChannels.push('whatsapp');
    businessChannels.push('sms');
    businessRecipient.phone = appointment.business.phone;
  }

  if (businessChannels.length > 0) {
    await sendMultiChannelNotification(
      appointment.business.id,
      'admin_new_booking',
      businessChannels,
      businessRecipient,
      variables,
      appointment.id
    );
  }
}

// Route לדחיית בקשת עריכה
export async function DELETE(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    const pendingEdit = await prisma.pendingAppointmentEdit.findUnique({
      where: {
        confirmationToken: token,
      },
    });

    if (!pendingEdit) {
      return NextResponse.json(
        { error: 'Invalid confirmation token' },
        { status: 404 }
      );
    }

    if (pendingEdit.status !== 'pending') {
      return NextResponse.json(
        { error: 'Edit request already processed' },
        { status: 400 }
      );
    }

    await prisma.pendingAppointmentEdit.update({
      where: { id: pendingEdit.id },
      data: {
        status: 'rejected',
        rejectedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'בקשת העריכה נדחתה',
    });
  } catch (error) {
    console.error('Error rejecting edit:', error);
    return NextResponse.json(
      { error: 'Failed to reject edit' },
      { status: 500 }
    );
  }
}

