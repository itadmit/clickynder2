/**
 * Staff API Routes
 * GET /api/staff - List staff
 * POST /api/staff - Create staff
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const staffSchema = z.object({
  businessId: z.string(),
  name: z.string().min(2),
  email: z.string().email().nullable().optional(),
  phone: z.string().optional(),
  branchId: z.string().nullable().optional(),
  roleLabel: z.string().optional(),
  calendarColor: z.string().optional(),
  calendarProvider: z.enum(['none', 'google', 'outlook', 'apple']).default('none'),
  active: z.boolean().default(true),
  serviceIds: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find business by owner
    const business = await prisma.business.findFirst({
      where: {
        ownerUserId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const staff = await prisma.staff.findMany({
      where: {
        businessId: business.id,
        deletedAt: null,
      },
      include: {
        branch: true,
        serviceStaff: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = staffSchema.parse(body);

    // Create staff
    const staff = await prisma.staff.create({
      data: {
        businessId: validatedData.businessId,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        branchId: validatedData.branchId,
        roleLabel: validatedData.roleLabel,
        calendarColor: validatedData.calendarColor,
        calendarProvider: validatedData.calendarProvider,
        active: validatedData.active,
      },
    });

    // Link services
    if (validatedData.serviceIds.length > 0) {
      await prisma.serviceStaff.createMany({
        data: validatedData.serviceIds.map((serviceId) => ({
          serviceId,
          staffId: staff.id,
        })),
      });
    }

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

