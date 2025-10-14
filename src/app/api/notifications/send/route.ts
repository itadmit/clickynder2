/**
 * API Route לשליחת התראות
 * POST /api/notifications/send
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sendNotification, sendNotificationFromTemplate } from '@/lib/notifications/notification-service';
import { NotificationChannel, NotificationEvent } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      businessId,
      channel,
      event,
      toAddress,
      subject,
      message,
      useTemplate,
      templateVariables,
      appointmentId,
      customerId,
    } = body;

    // ולידציה
    if (!businessId || !channel || !event || !toAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let success: boolean;

    if (useTemplate && templateVariables) {
      // שליחה עם תבנית
      success = await sendNotificationFromTemplate(
        businessId,
        channel as NotificationChannel,
        event as NotificationEvent,
        toAddress,
        templateVariables,
        appointmentId,
        customerId
      );
    } else {
      // שליחה ישירה
      success = await sendNotification({
        businessId,
        channel: channel as NotificationChannel,
        event: event as NotificationEvent,
        toAddress,
        subject,
        body: message,
        appointmentId,
        customerId,
      });
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Notification sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send notification API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

