/**
 * Slot Policy API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { businessId, ...policyData } = body;

    const slotPolicy = await prisma.slotPolicy.upsert({
      where: { businessId },
      create: {
        businessId,
        ...policyData,
      },
      update: policyData,
    });

    return NextResponse.json(slotPolicy);
  } catch (error) {
    console.error('Error updating slot policy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

