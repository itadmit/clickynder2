/**
 * Branches API Routes
 * GET /api/branches - List branches
 * POST /api/branches - Create branch
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const branchSchema = z.object({
  businessId: z.string(),
  name: z.string().min(2),
  address: z.string().optional(),
  phone: z.string().optional(),
  hasCustomHours: z.boolean().default(false),
  active: z.boolean().default(true),
  isDefault: z.boolean().default(false),
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

    const branches = await prisma.branch.findMany({
      where: {
        businessId: business.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
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
    const validatedData = branchSchema.parse(body);

    // If this is set as default, unset all other defaults
    if (validatedData.isDefault) {
      await prisma.branch.updateMany({
        where: {
          businessId: validatedData.businessId,
          deletedAt: null,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const branch = await prisma.branch.create({
      data: validatedData,
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    console.error('Error creating branch:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

