/**
 * Services API Routes
 * GET /api/services - List services
 * POST /api/services - Create service
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const serviceSchema = z.object({
  businessId: z.string(),
  name: z.string().min(2),
  categoryId: z.string().nullable().optional(),
  durationMin: z.number().min(5),
  priceCents: z.number().min(0).nullable().optional(),
  bufferAfterMin: z.number().min(0).default(0),
  description: z.string().optional(),
  color: z.string().optional(),
  active: z.boolean().default(true),
  staffIds: z.array(z.string()).default([]),
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

    const services = await prisma.service.findMany({
      where: {
        businessId: business.id,
        deletedAt: null,
      },
      include: {
        category: true,
        serviceStaff: {
          include: {
            staff: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
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
    const validatedData = serviceSchema.parse(body);

    // Create service
    const service = await prisma.service.create({
      data: {
        businessId: validatedData.businessId,
        name: validatedData.name,
        categoryId: validatedData.categoryId,
        durationMin: validatedData.durationMin,
        priceCents: validatedData.priceCents,
        bufferAfterMin: validatedData.bufferAfterMin,
        description: validatedData.description,
        color: validatedData.color,
        active: validatedData.active,
      },
    });

    // Link staff
    if (validatedData.staffIds.length > 0) {
      await prisma.serviceStaff.createMany({
        data: validatedData.staffIds.map((staffId) => ({
          serviceId: service.id,
          staffId,
        })),
      });
    }

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

