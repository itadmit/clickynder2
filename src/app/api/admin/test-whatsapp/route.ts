import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/notifications/rappelsend';

// POST - שליחת הודעת ניסיון
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // בדיקה שהמשתמש הנוכחי הוא Super Admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isSuperAdmin: true },
    });

    if (!currentUser?.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
    }

    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    // הודעת ניסיון
    const testMessage = `שלום! 👋

זוהי הודעת ניסיון מ-Clickinder.

המערכת שלך מחוברת בהצלחה ל-WhatsApp Business דרך Rappelsend! ✅

כל ההודעות ללקוחות ישלחו כעת אוטומטית בוואטסאפ.

בהצלחה! 🎉
צוות Clickinder`;

    // שליחת ההודעה
    const result = await sendWhatsAppMessage(phone, testMessage);

    if (result.success) {
      return NextResponse.json({
        success: true,
        normalizedPhone: result.data?.mobile || phone,
        message: 'Test message sent successfully',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send message',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Failed to send test message' },
      { status: 500 }
    );
  }
}

