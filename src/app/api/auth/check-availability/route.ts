/**
 * Check Email/Phone Availability API
 * GET /api/auth/check-availability?email=...&phone=...
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'יש לספק אימייל או טלפון' },
        { status: 400 }
      );
    }

    const result: { emailAvailable?: boolean; phoneAvailable?: boolean } = {};

    // בדיקת אימייל
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      result.emailAvailable = !existingEmail;
    }

    // בדיקת טלפון
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
        select: { id: true },
      });
      result.phoneAvailable = !existingPhone;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'אירעה שגיאה בבדיקת הזמינות' },
      { status: 500 }
    );
  }
}

