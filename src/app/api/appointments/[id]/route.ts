import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const business = await prisma.business.findFirst({
      where: {
        ownerUserId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        businessId: business.id,
      },
      include: {
        customer: true,
        service: true,
        staff: true,
        branch: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...appointment,
      business: {
        currency: business.currency,
      },
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const business = await prisma.business.findFirst({
      where: {
        ownerUserId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, notesInternal, notesCustomer } = body;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        businessId: business.id,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(notesInternal !== undefined && { notesInternal }),
        ...(notesCustomer !== undefined && { notesCustomer }),
        ...(status === 'canceled' && { canceledAt: new Date() }),
      },
      include: {
        customer: true,
        service: true,
        staff: true,
        branch: true,
      },
    });

    // Create dashboard notification for canceled appointment
    if (status === 'canceled') {
      await prisma.dashboardNotification.create({
        data: {
          businessId: business.id,
          appointmentId: updatedAppointment.id,
          customerId: updatedAppointment.customerId,
          type: 'cancelled_appointment',
          title: 'תור בוטל',
          message: `תור של ${updatedAppointment.customer.firstName} ${updatedAppointment.customer.lastName} ל${updatedAppointment.service.name} בוטל`,
          read: false,
        },
      });
    }

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const business = await prisma.business.findFirst({
      where: {
        ownerUserId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        businessId: business.id,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Soft delete by setting status to canceled
    const deletedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
      include: {
        customer: true,
        service: true,
      },
    });

    // Create dashboard notification
    await prisma.dashboardNotification.create({
      data: {
        businessId: business.id,
        appointmentId: deletedAppointment.id,
        customerId: deletedAppointment.customerId,
        type: 'cancelled_appointment',
        title: 'תור נמחק',
        message: `תור של ${deletedAppointment.customer.firstName} ${deletedAppointment.customer.lastName} ל${deletedAppointment.service.name} נמחק`,
        read: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}

