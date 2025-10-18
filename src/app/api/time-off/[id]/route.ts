/**
 * Time Off Detail API Routes
 * PUT /api/time-off/[id] - Update time-off
 * DELETE /api/time-off/[id] - Delete time-off
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
    const { startAt, endAt, reason } = body;

    if (!startAt || !endAt) {
      return NextResponse.json(
        { error: 'startAt and endAt are required' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startAt);
    const end = new Date(endAt);
    
    if (start >= end) {
      return NextResponse.json({ error: 'תאריך סיום חייב להיות אחרי תאריך התחלה' }, { status: 400 });
    }

    const timeOff = await prisma.timeOff.update({
      where: { id: params.id },
      data: {
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
    console.error('Error updating time-off:', error);
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

    await prisma.timeOff.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting time-off:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 400 });
  }
}

