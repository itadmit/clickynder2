/**
 * Email Service
 * שירות לשליחת אימיילים דרך SMTP
 */

import nodemailer from 'nodemailer';

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

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    console.warn('SMTP credentials not configured');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: parseInt(port || '587'),
    secure: port === '465',
    auth: {
      user,
      pass: password,
    },
  });

  return transporter;
}

export async function sendEmail(params: EmailParams): Promise<EmailResponse> {
  const transport = getTransporter();

  if (!transport) {
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const from = process.env.EMAIL_FROM || 'noreply@clickinder.co.il';

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

