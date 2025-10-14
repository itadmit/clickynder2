/**
 * Webhook לקבלת עדכוני סטטוס מ-Rappelsend
 * POST /api/webhooks/rappelsend
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('Rappelsend webhook received:', body);

    // עדכון סטטוס ההודעה במסד הנתונים
    const { message_id, status, mobile, timestamp } = body;

    if (message_id) {
      await prisma.notification.updateMany({
        where: {
          providerMessageId: message_id,
        },
        data: {
          status: status === 'delivered' ? 'sent' : 'failed',
          sentAt: timestamp ? new Date(timestamp) : new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed',
    });
  } catch (error) {
    console.error('Error processing Rappelsend webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

