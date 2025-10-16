/**
 * Admin API: Change Business Package/Subscription
 * PATCH /api/admin/subscriptions/[businessId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // בדיקת הרשאות Super Admin
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 403 }
      );
    }

    const { businessId } = params;
    const { packageCode } = await req.json();

    if (!packageCode) {
      return NextResponse.json(
        { error: 'Package code is required' },
        { status: 400 }
      );
    }

    // בדיקת קיום החבילה
    const targetPackage = await prisma.package.findUnique({
      where: { code: packageCode },
    });

    if (!targetPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // בדיקת קיום העסק
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        subscription: {
          include: { package: true },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // עדכון או יצירת מנוי חדש
    let updatedSubscription;

    if (business.subscription) {
      // עדכון מנוי קיים
      updatedSubscription = await prisma.subscription.update({
        where: { id: business.subscription.id },
        data: {
          packageId: targetPackage.id,
        },
        include: {
          package: true,
        },
      });
    } else {
      // יצירת מנוי חדש
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 ימי ניסיון

      updatedSubscription = await prisma.subscription.create({
        data: {
          businessId: business.id,
          packageId: targetPackage.id,
          status: 'trial',
          startDate: new Date(),
          trialEndDate,
        },
        include: {
          package: true,
        },
      });
    }

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error('Error changing package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

