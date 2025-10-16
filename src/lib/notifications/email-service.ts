/**
 * Email Service
 * שירות לשליחת אימיילים דרך Google SMTP (או SMTP אחר)
 * ההגדרות נשמרות בדאטהבייס דרך SystemSettings
 */

import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

interface EmailParams {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

let transporter: nodemailer.Transporter | null = null;
let cachedConfig: SMTPConfig | null = null;
let configCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// פונקציה לפיענוח סיסמה מוצפנת
function decryptPassword(encryptedPassword: string): string {
  try {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-characters-long!', 'utf-8').slice(0, 32);
    const parts = encryptedPassword.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Error decrypting password:', error);
    return encryptedPassword;
  }
}

// קריאת הגדרות SMTP מהדאטהבייס
async function getSMTPConfig(): Promise<SMTPConfig | null> {
  // בדיקת cache
  const now = Date.now();
  if (cachedConfig && (now - configCacheTime) < CACHE_DURATION) {
    return cachedConfig;
  }

  try {
    const settings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_password', 'smtp_from_name', 'smtp_from_email']
        }
      }
    });

    const settingsMap = new Map(settings.map(s => [s.key, s]));

    const host = settingsMap.get('smtp_host')?.value;
    const port = settingsMap.get('smtp_port')?.value;
    const user = settingsMap.get('smtp_user')?.value;
    const passwordSetting = settingsMap.get('smtp_password');

    // אם אין הגדרות, נסה ENV כ-fallback
    if (!host || !user || !passwordSetting) {
      console.warn('SMTP not configured in database, trying ENV');
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        const config: SMTPConfig = {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          user: process.env.SMTP_USER,
          password: process.env.SMTP_PASSWORD,
          fromName: process.env.EMAIL_FROM_NAME || 'Clickynder',
          fromEmail: process.env.EMAIL_FROM || process.env.SMTP_USER,
        };
        cachedConfig = config;
        configCacheTime = now;
        return config;
      }
      return null;
    }

    const password = passwordSetting.isEncrypted 
      ? decryptPassword(passwordSetting.value)
      : passwordSetting.value;

    const config: SMTPConfig = {
      host,
      port: parseInt(port || '587'),
      secure: settingsMap.get('smtp_secure')?.value === 'true',
      user,
      password,
      fromName: settingsMap.get('smtp_from_name')?.value || 'Clickynder',
      fromEmail: settingsMap.get('smtp_from_email')?.value || user,
    };

    cachedConfig = config;
    configCacheTime = now;
    return config;
  } catch (error) {
    console.error('Error loading SMTP config:', error);
    return null;
  }
}

async function getTransporter(): Promise<nodemailer.Transporter | null> {
  // נקה transporter אם ה-cache פג תוקף
  if (transporter && cachedConfig && (Date.now() - configCacheTime) >= CACHE_DURATION) {
    transporter = null;
  }

  if (transporter) {
    return transporter;
  }

  const config = await getSMTPConfig();
  if (!config) {
    console.warn('SMTP credentials not configured');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });

  return transporter;
}

export async function sendEmail(params: EmailParams): Promise<EmailResponse> {
  const transport = await getTransporter();

  if (!transport) {
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const config = await getSMTPConfig();
    const from = config 
      ? `"${config.fromName}" <${config.fromEmail}>`
      : process.env.EMAIL_FROM || 'noreply@clickinder.co.il';

    const info = await transport.sendMail({
      from,
      to: params.to,
      subject: params.subject,
      text: params.body,
      html: params.html || params.body.replace(/\n/g, '<br>'),
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// פונקציה לבדיקת חיבור SMTP
export async function testSMTPConnection(): Promise<EmailResponse> {
  try {
    const transport = await getTransporter();
    if (!transport) {
      return {
        success: false,
        error: 'SMTP not configured',
      };
    }

    await transport.verify();
    return {
      success: true,
    };
  } catch (error) {
    console.error('SMTP connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

