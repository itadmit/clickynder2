/**
 * Book Appointment API
 * POST /api/appointments/book - Create a new appointment
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateConfirmationCode, addMinutes } from '@/lib/utils';
import { sendBookingConfirmation } from '@/lib/notifications/notification-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessId,
      branchId,
      serviceId,
      staffId,
      date,
      time,
      customerName,
      customerPhone,
      customerEmail,
      notes,
    } = body;

    // Validate required fields
    if (!businessId || !serviceId || !date || !time || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Parse date and time
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const startAt = new Date(year, month - 1, day, hours, minutes);
    const endAt = addMinutes(startAt, service.durationMin + (service.bufferAfterMin || 0));

    // Check if slot is still available
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        businessId,
        ...(staffId && { staffId }),
        status: {
          notIn: ['canceled'],
        },
        OR: [
          {
            AND: [
              { startAt: { lte: startAt } },
              { endAt: { gt: startAt } },
            ],
          },
          {
            AND: [
              { startAt: { lt: endAt } },
              { endAt: { gte: endAt } },
            ],
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: 'השעה הזו כבר תפוסה, אנא בחר שעה אחרת' },
        { status: 409 }
      );
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: {
        businessId,
        phone: customerPhone,
      },
    });

    if (!customer) {
      const [firstName, ...lastNameParts] = customerName.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      customer = await prisma.customer.create({
        data: {
          businessId,
          firstName,
          lastName,
          phone: customerPhone,
          email: customerEmail,
          notes,
        },
      });
    }

    // Create appointment
    const confirmationCode = generateConfirmationCode();
    
    const appointment = await prisma.appointment.create({
      data: {
        businessId,
        branchId,
        serviceId,
        staffId,
        customerId: customer.id,
        startAt,
        endAt,
        status: 'confirmed',
        priceCents: service.priceCents,
        paymentStatus: 'not_required',
        confirmationCode,
        notesCustomer: notes,
        source: 'public',
      },
    });

    // Update usage counter
    const periodMonth = new Date(startAt.getFullYear(), startAt.getMonth(), 1);
    await prisma.usageCounter.upsert({
      where: {
        businessId_periodMonth: {
          businessId,
          periodMonth,
        },
      },
      create: {
        businessId,
        periodMonth,
        appointmentsCount: 1,
      },
      update: {
        appointmentsCount: {
          increment: 1,
        },
      },
    });

    // Send confirmation notifications (async)
    sendBookingConfirmation(appointment.id).catch((error) => {
      console.error('Error sending booking confirmation:', error);
    });

    // Create dashboard notification
    await prisma.dashboardNotification.create({
      data: {
        businessId,
        appointmentId: appointment.id,
        customerId: customer.id,
        type: 'new_appointment',
        title: 'תור חדש נקבע',
        message: `${customerName} קבע תור ל${service.name} בתאריך ${new Date(startAt).toLocaleDateString('he-IL')} בשעה ${time}`,
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      confirmationCode,
      appointmentId: appointment.id,
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json(
      { error: 'אירעה שגיאה ביצירת התור' },
      { status: 500 }
    );
  }
}

