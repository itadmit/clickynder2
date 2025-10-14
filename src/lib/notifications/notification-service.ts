/**
 * Notification Service
 * מערכת מרכזית לשליחת התראות דרך SMS, Email ו-WhatsApp
 */

import { PrismaClient, NotificationChannel, NotificationEvent, NotificationStatus } from '@prisma/client';
import { sendWhatsAppMessage, RappelsendService } from './rappelsend';
import { sendEmail } from './email-service';
import { sendSMS } from './sms-service';

const prisma = new PrismaClient();

export interface NotificationParams {
  businessId: string;
  channel: NotificationChannel;
  event: NotificationEvent;
  toAddress: string;
  subject?: string;
  body: string;
  appointmentId?: string;
  customerId?: string;
}

export interface TemplateVariables {
  customer_name?: string;
  business_name?: string;
  service_name?: string;
  staff_name?: string;
  branch_name?: string;
  appointment_date?: string;
  appointment_time?: string;
  confirmation_code?: string;
  appointment_duration?: string;
  appointment_price?: string;
  cancellation_link?: string;
  reschedule_link?: string;
}

/**
 * שליחת התראה לפי ערוץ
 */
export async function sendNotification(params: NotificationParams): Promise<boolean> {
  try {
    let success = false;
    let providerMessageId: string | undefined;

    // שליחה לפי הערוץ
    switch (params.channel) {
      case 'whatsapp':
        const whatsappResult = await sendWhatsAppMessage(params.toAddress, params.body);
        success = whatsappResult.success;
        providerMessageId = whatsappResult.data?.message_id;
        break;

      case 'sms':
        const smsResult = await sendSMS(params.toAddress, params.body);
        success = smsResult.success;
        providerMessageId = smsResult.messageId;
        break;

      case 'email':
        const emailResult = await sendEmail({
          to: params.toAddress,
          subject: params.subject || 'הודעה מהעסק',
          body: params.body,
        });
        success = emailResult.success;
        providerMessageId = emailResult.messageId;
        break;
    }

    // שמירת התראה במסד הנתונים
    await prisma.notification.create({
      data: {
        businessId: params.businessId,
        appointmentId: params.appointmentId,
        customerId: params.customerId,
        channel: params.channel,
        event: params.event,
        toAddress: params.toAddress,
        status: success ? NotificationStatus.sent : NotificationStatus.failed,
        providerMessageId,
        sentAt: success ? new Date() : null,
      },
    });

    return success;
  } catch (error) {
    console.error('Error sending notification:', error);
    
    // שמירת התראה כ-failed
    await prisma.notification.create({
      data: {
        businessId: params.businessId,
        appointmentId: params.appointmentId,
        customerId: params.customerId,
        channel: params.channel,
        event: params.event,
        toAddress: params.toAddress,
        status: NotificationStatus.failed,
      },
    });

    return false;
  }
}

/**
 * שליחת התראה עם תבנית
 */
export async function sendNotificationFromTemplate(
  businessId: string,
  channel: NotificationChannel,
  event: NotificationEvent,
  toAddress: string,
  variables: TemplateVariables,
  appointmentId?: string,
  customerId?: string
): Promise<boolean> {
  try {
    // שליפת תבנית ההתראה
    const template = await prisma.notificationTemplate.findUnique({
      where: {
        businessId_channel_event: {
          businessId,
          channel,
          event,
        },
      },
    });

    if (!template || !template.active) {
      console.warn(`No active template found for ${channel} - ${event}`);
      return false;
    }

    // החלפת משתנים בתבנית
    let body = replaceTemplateVariables(template.body, variables);
    let subject = template.subject ? replaceTemplateVariables(template.subject, variables) : undefined;

    // שליחת ההתראה
    return sendNotification({
      businessId,
      channel,
      event,
      toAddress,
      subject,
      body,
      appointmentId,
      customerId,
    });
  } catch (error) {
    console.error('Error sending notification from template:', error);
    return false;
  }
}

/**
 * שליחת התראות מרובות בו-זמנית
 */
export async function sendMultiChannelNotification(
  businessId: string,
  event: NotificationEvent,
  channels: NotificationChannel[],
  recipient: {
    phone?: string;
    email?: string;
  },
  variables: TemplateVariables,
  appointmentId?: string,
  customerId?: string
): Promise<{ channel: NotificationChannel; success: boolean }[]> {
  const results: { channel: NotificationChannel; success: boolean }[] = [];

  for (const channel of channels) {
    let toAddress: string | undefined;

    // קביעת כתובת היעד לפי הערוץ
    switch (channel) {
      case 'whatsapp':
      case 'sms':
        toAddress = recipient.phone;
        break;
      case 'email':
        toAddress = recipient.email;
        break;
    }

    if (!toAddress) {
      results.push({ channel, success: false });
      continue;
    }

    const success = await sendNotificationFromTemplate(
      businessId,
      channel,
      event,
      toAddress,
      variables,
      appointmentId,
      customerId
    );

    results.push({ channel, success });
  }

  return results;
}

/**
 * שליחת תזכורת לתור
 */
export async function sendAppointmentReminder(appointmentId: string): Promise<boolean> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        business: true,
        customer: true,
        service: true,
        staff: true,
        branch: true,
      },
    });

    if (!appointment) {
      console.error('Appointment not found');
      return false;
    }

    const variables: TemplateVariables = {
      customer_name: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
      business_name: appointment.business.name,
      service_name: appointment.service.name,
      staff_name: appointment.staff?.name,
      branch_name: appointment.branch?.name,
      appointment_date: appointment.startAt.toLocaleDateString('he-IL'),
      appointment_time: appointment.startAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      confirmation_code: appointment.confirmationCode,
    };

    // שליחה בכל הערוצים הזמינים
    const channels: NotificationChannel[] = [];
    if (appointment.customer.phone) {
      channels.push('whatsapp', 'sms');
    }
    if (appointment.customer.email) {
      channels.push('email');
    }

    const results = await sendMultiChannelNotification(
      appointment.businessId,
      'booking_reminder',
      channels,
      {
        phone: appointment.customer.phone,
        email: appointment.customer.email || undefined,
      },
      variables,
      appointmentId,
      appointment.customerId
    );

    return results.some(r => r.success);
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    return false;
  }
}

/**
 * שליחת אישור הזמנה
 */
export async function sendBookingConfirmation(appointmentId: string): Promise<boolean> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        business: true,
        customer: true,
        service: true,
        staff: true,
        branch: true,
      },
    });

    if (!appointment) {
      console.error('Appointment not found');
      return false;
    }

    const variables: TemplateVariables = {
      customer_name: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
      business_name: appointment.business.name,
      service_name: appointment.service.name,
      staff_name: appointment.staff?.name,
      branch_name: appointment.branch?.name,
      appointment_date: appointment.startAt.toLocaleDateString('he-IL'),
      appointment_time: appointment.startAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      confirmation_code: appointment.confirmationCode,
    };

    // שליחה ללקוח
    const channels: NotificationChannel[] = [];
    if (appointment.customer.phone) {
      channels.push('whatsapp');
    }
    if (appointment.customer.email) {
      channels.push('email');
    }

    const customerResults = await sendMultiChannelNotification(
      appointment.businessId,
      'booking_confirmed',
      channels,
      {
        phone: appointment.customer.phone,
        email: appointment.customer.email || undefined,
      },
      variables,
      appointmentId,
      appointment.customerId
    );

    // שליחת התראה לעסק (רק אם יש אימייל לעסק)
    let businessNotification = false;
    if (appointment.business.email) {
      businessNotification = await sendNotificationFromTemplate(
        appointment.businessId,
        'email',
        'admin_new_booking',
        appointment.business.email,
        variables,
        appointmentId
      );
    }

    return customerResults.some(r => r.success) || businessNotification;
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return false;
  }
}

/**
 * החלפת משתנים בתבנית
 */
function replaceTemplateVariables(template: string, variables: TemplateVariables): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined) {
      // תמיכה בשני פורמטים: {variable} ו-{{variable}}
      const regex1 = new RegExp(`{\\s*${key}\\s*}`, 'g');
      const regex2 = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex1, value);
      result = result.replace(regex2, value);
    }
  }

  return result;
}

