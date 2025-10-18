/**
 * Service Category Detail API Routes
 * PUT /api/service-categories/[id] - Update category
 * DELETE /api/service-categories/[id] - Delete category
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Get the category to check businessId
    const existing = await prisma.serviceCategory.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if another category with same name exists
    const duplicate = await prisma.serviceCategory.findFirst({
      where: {
        businessId: existing.businessId,
        name,
        id: { not: params.id },
      },
    });

    if (duplicate) {
      return NextResponse.json({ error: 'קטגוריה בשם זה כבר קיימת' }, { status: 400 });
    }

    const category = await prisma.serviceCategory.update({
      where: { id: params.id },
      data: { name },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
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

    // Check if category has services
    const servicesCount = await prisma.service.count({
      where: {
        categoryId: params.id,
        deletedAt: null,
      },
    });

    if (servicesCount > 0) {
      return NextResponse.json(
        { error: `לא ניתן למחוק קטגוריה שמכילה ${servicesCount} שירותים. הסר את השירותים מהקטגוריה תחילה.` },
        { status: 400 }
      );
    }

    // Hard delete (no deletedAt field in ServiceCategory)
    await prisma.serviceCategory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

