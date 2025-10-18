/**
 * Time Off API Routes
 * GET /api/time-off - Get all time-offs
 * POST /api/time-off - Create time-off
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
    const staffId = searchParams.get('staffId');
    const branchId = searchParams.get('branchId');

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    const where: any = { businessId };
    
    if (staffId) {
      where.staffId = staffId;
      where.scope = 'staff';
    }
    
    if (branchId) {
      where.branchId = branchId;
      where.scope = 'branch';
    }

    const timeOffs = await prisma.timeOff.findMany({
      where,
      include: {
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startAt: 'asc',
      },
    });

    return NextResponse.json(timeOffs);
  } catch (error) {
    console.error('Error fetching time-offs:', error);
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
    const { businessId, scope, staffId, branchId, startAt, endAt, reason } = body;

    if (!businessId || !scope || !startAt || !endAt) {
      return NextResponse.json(
        { error: 'businessId, scope, startAt, and endAt are required' },
        { status: 400 }
      );
    }

    if (scope === 'staff' && !staffId) {
      return NextResponse.json({ error: 'staffId is required for staff time-off' }, { status: 400 });
    }

    if (scope === 'branch' && !branchId) {
      return NextResponse.json({ error: 'branchId is required for branch time-off' }, { status: 400 });
    }

    // Validate dates
    const start = new Date(startAt);
    const end = new Date(endAt);
    
    if (start >= end) {
      return NextResponse.json({ error: 'תאריך סיום חייב להיות אחרי תאריך התחלה' }, { status: 400 });
    }

    const timeOff = await prisma.timeOff.create({
      data: {
        businessId,
        scope,
        staffId: scope === 'staff' ? staffId : null,
        branchId: scope === 'branch' ? branchId : null,
        startAt: start,
        endAt: end,
        reason: reason || null,
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(timeOff);
  } catch (error) {
    console.error('Error creating time-off:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

