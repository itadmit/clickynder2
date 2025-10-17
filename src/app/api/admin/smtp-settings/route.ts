/**
 * Admin API: SMTP Settings Management
 * GET /api/admin/smtp-settings - קבלת הגדרות SMTP
 * POST /api/admin/smtp-settings - שמירת הגדרות SMTP
 * POST /api/admin/smtp-settings/test - בדיקת חיבור SMTP
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { testSMTPConnection } from '@/lib/notifications/email-service';
import crypto from 'crypto';

// פונקציה להצפנת סיסמה
function encryptPassword(password: string): string {
  const algorithm = 'aes-256-cbc';
  // יצירת key באורך 32 bytes בדיוק
  const keySource = process.env.ENCRYPTION_KEY || 'clickynder-default-encryption-key-2024';
  const key = crypto.createHash('sha256').update(keySource).digest(); // 32 bytes
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(password, 'utf-8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// GET - קבלת הגדרות SMTP (ללא סיסמה)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!(session?.user as any)?.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 403 }
      );
    }

    const settings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_from_name', 'smtp_from_email']
        }
      }
    });

    const settingsObj: Record<string, string> = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    // בדיקה אם יש סיסמה
    const passwordSetting = await prisma.systemSettings.findUnique({
      where: { key: 'smtp_password' }
    });

    return NextResponse.json({
      ...settingsObj,
      hasPassword: !!passwordSetting,
    });
  } catch (error) {
    console.error('Error fetching SMTP settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - שמירת הגדרות SMTP
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!(session?.user as any)?.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_user,
      smtp_password,
      smtp_from_name,
      smtp_from_email,
    } = body;

    // ולידציה
    if (!smtp_host || !smtp_user || !smtp_from_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // שמירת ההגדרות
    const settingsToSave = [
      { key: 'smtp_host', value: String(smtp_host), description: 'SMTP Host (e.g., smtp.gmail.com)' },
      { key: 'smtp_port', value: String(smtp_port || '587'), description: 'SMTP Port (587 for TLS, 465 for SSL)' },
      { key: 'smtp_secure', value: String(smtp_secure || 'false'), description: 'Use SSL/TLS' },
      { key: 'smtp_user', value: String(smtp_user), description: 'SMTP Username (email)' },
      { key: 'smtp_from_name', value: String(smtp_from_name || 'Clickynder'), description: 'From Name' },
      { key: 'smtp_from_email', value: String(smtp_from_email), description: 'From Email Address' },
    ];

    // שמירה של כל הגדרה
    for (const setting of settingsToSave) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        create: {
          key: setting.key,
          value: setting.value,
          description: setting.description,
          isEncrypted: false,
        },
        update: {
          value: setting.value,
          description: setting.description,
        },
      });
    }

    // שמירת סיסמה מוצפנת (רק אם סופקה)
    if (smtp_password) {
      const encryptedPassword = encryptPassword(smtp_password);
      await prisma.systemSettings.upsert({
        where: { key: 'smtp_password' },
        create: {
          key: 'smtp_password',
          value: encryptedPassword,
          description: 'SMTP Password (encrypted)',
          isEncrypted: true,
        },
        update: {
          value: encryptedPassword,
          isEncrypted: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'SMTP settings saved successfully',
    });
  } catch (error) {
    console.error('Error saving SMTP settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Test SMTP Connection
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!(session?.user as any)?.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const result = await testSMTPConnection();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing SMTP:', error);
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    );
  }
}

