/**
 * Available Slots API
 * GET /api/appointments/slots - Get available time slots
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addMinutes, format, parse } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');
    const staffId = searchParams.get('staffId');

    if (!businessId || !serviceId || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
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

    // Get business hours for the day
    const dayOfWeek = new Date(date).getDay();
    const businessHours = await prisma.businessHours.findUnique({
      where: {
        businessId_weekday: {
          businessId,
          weekday: dayOfWeek,
        },
      },
    });

    if (!businessHours || !businessHours.active || !businessHours.openTime || !businessHours.closeTime) {
      return NextResponse.json({ slots: [] });
    }

    // Get existing appointments for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Check for business-wide holidays or time-offs
    const businessTimeOff = await prisma.timeOff.findFirst({
      where: {
        businessId,
        scope: 'business',
        startAt: { lte: endOfDay },
        endAt: { gte: startOfDay },
      },
    });

    // If there's a business-wide time-off, no slots available
    if (businessTimeOff) {
      return NextResponse.json({ slots: [], reason: 'holiday' });
    }

    // Check for staff time-off (if staffId is provided)
    if (staffId) {
      const staffTimeOff = await prisma.timeOff.findFirst({
        where: {
          staffId,
          scope: 'staff',
          startAt: { lte: endOfDay },
          endAt: { gte: startOfDay },
        },
      });

      if (staffTimeOff) {
        return NextResponse.json({ slots: [], reason: 'staff_unavailable' });
      }
    }

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        businessId,
        ...(staffId && { staffId }),
        startAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ['canceled'],
        },
      },
    });

    // Generate available slots
    const slots: string[] = [];
    const openTime = parse(businessHours.openTime, 'HH:mm', new Date(date));
    const closeTime = parse(businessHours.closeTime, 'HH:mm', new Date(date));
    
    let currentSlot = openTime;
    while (currentSlot < closeTime) {
      const slotEnd = addMinutes(currentSlot, service.durationMin);
      
      if (slotEnd <= closeTime) {
        // Check if slot is available
        const isAvailable = !existingAppointments.some((appointment) => {
          const appointmentStart = new Date(appointment.startAt);
          const appointmentEnd = new Date(appointment.endAt);
          
          return (
            (currentSlot >= appointmentStart && currentSlot < appointmentEnd) ||
            (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
            (currentSlot <= appointmentStart && slotEnd >= appointmentEnd)
          );
        });

        if (isAvailable) {
          slots.push(format(currentSlot, 'HH:mm'));
        }
      }

      // Move to next slot (every 15 minutes)
      currentSlot = addMinutes(currentSlot, 15);
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

