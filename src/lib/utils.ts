/**
 * Utility Functions
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price with currency support
 * @param cents - Price in cents
 * @param currency - Currency code (default: ILS)
 */
export function formatPrice(cents: number, currency: string = 'ILS'): string {
  const amount = cents / 100;
  
  // Map currency to locale
  const localeMap: Record<string, string> = {
    'ILS': 'he-IL',
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
  };
  
  const locale = localeMap[currency] || 'he-IL';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format date in Hebrew
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('he-IL', options || {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Format time in Hebrew
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('972')) {
    return `+972-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  
  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  
  return phone;
}

/**
 * Generate random confirmation code
 */
export function generateConfirmationCode(): string {
  const prefix = 'CL';
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${random}`;
}

/**
 * Calculate duration between two dates in minutes
 */
export function calculateDuration(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

// Re-export from date-fns for consistency
export { addMinutes as addMinutesDateFns, format, parse, startOfDay } from 'date-fns';

/**
 * Check if time slot is available
 */
export function isSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  existingAppointments: { startAt: Date; endAt: Date }[]
): boolean {
  return !existingAppointments.some(
    (appointment) =>
      (slotStart >= appointment.startAt && slotStart < appointment.endAt) ||
      (slotEnd > appointment.startAt && slotEnd <= appointment.endAt) ||
      (slotStart <= appointment.startAt && slotEnd >= appointment.endAt)
  );
}

/**
 * Get day of week in Hebrew
 */
export function getDayName(dayIndex: number): string {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return days[dayIndex] || '';
}

/**
 * נרמול מספר טלפון ישראלי לפורמט בינלאומי
 * @param phone - מספר טלפון בכל פורמט
 * @returns מספר טלפון בפורמט 972XXXXXXXXX
 * 
 * דוגמאות:
 * - normalizeIsraeliPhone('0542284283') => '972542284283'
 * - normalizeIsraeliPhone('054-228-4283') => '972542284283'
 * - normalizeIsraeliPhone('+972542284283') => '972542284283'
 */
export function normalizeIsraeliPhone(phone: string): string {
  // הסרת כל התווים שאינם ספרות או +
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // הסרת + מההתחלה
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // טיפול ב-00972
  if (cleaned.startsWith('00972')) {
    return '972' + cleaned.substring(5);
  }
  
  // אם מתחיל ב-972, החזר כפי שהוא
  if (cleaned.startsWith('972')) {
    return cleaned.length >= 12 ? cleaned.substring(0, 12) : cleaned;
  }
  
  // אם מתחיל ב-0, החלף ל-972
  if (cleaned.startsWith('0')) {
    return '972' + cleaned.substring(1);
  }
  
  // אם 9 ספרות מתחיל ב-5-9, הוסף 972
  if (cleaned.length === 9 && /^[5-9]/.test(cleaned)) {
    return '972' + cleaned;
  }
  
  // ברירת מחדל - הוסף 972
  return '972' + cleaned;
}

/**
 * Validate Israeli phone number
 */
export function isValidIsraeliPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  
  // Israeli phone format: 05X-XXXXXXX or +972-5X-XXXXXXX
  return /^(0|972)5[0-9]{8}$/.test(cleaned);
}

/**
 * Slugify string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

