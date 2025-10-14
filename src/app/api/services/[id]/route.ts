/**
 * Service Detail API Routes
 * GET /api/services/[id] - Get service
 * PUT /api/services/[id] - Update service
 * PATCH /api/services/[id] - Partial update
 * DELETE /api/services/[id] - Delete service
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        serviceStaff: {
          include: {
            staff: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Update service
    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        name: body.name,
        categoryId: body.categoryId,
        durationMin: body.durationMin,
        priceCents: body.priceCents,
        bufferAfterMin: body.bufferAfterMin,
        description: body.description,
        color: body.color,
        active: body.active,
      },
    });

    // Update staff assignments
    if (body.staffIds) {
      // Delete existing assignments
      await prisma.serviceStaff.deleteMany({
        where: { serviceId: params.id },
      });

      // Create new assignments
      if (body.staffIds.length > 0) {
        await prisma.serviceStaff.createMany({
          data: body.staffIds.map((staffId: string) => ({
            serviceId: params.id,
            staffId,
          })),
        });
      }
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const service = await prisma.service.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Soft delete
    await prisma.service.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

