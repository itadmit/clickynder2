/**
 * Service Categories API Routes
 * GET /api/service-categories - Get all categories
 * POST /api/service-categories - Create category
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    const categories = await prisma.serviceCategory.findMany({
      where: { 
        businessId,
      },
      orderBy: {
        position: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
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
    const { name, businessId } = body;

    if (!name || !businessId) {
      return NextResponse.json({ error: 'Name and businessId are required' }, { status: 400 });
    }

    // Check if category with same name already exists
    const existing = await prisma.serviceCategory.findFirst({
      where: {
        businessId,
        name,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'קטגוריה בשם זה כבר קיימת' }, { status: 400 });
    }

    // Get max position for new category
    const maxPosition = await prisma.serviceCategory.aggregate({
      where: { businessId },
      _max: { position: true },
    });

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        businessId,
        position: (maxPosition._max.position || 0) + 1,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

