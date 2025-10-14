import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { ownedBusinesses: true },
    });

    if (!user || user.ownedBusinesses.length === 0) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const business = user.ownedBusinesses[0];

    // Mark all unread notifications as read
    await prisma.dashboardNotification.updateMany({
      where: {
        businessId: business.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}


