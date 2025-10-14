/**
 * Rappelsend WhatsApp API Integration
 * https://rappelsend.com
 */

interface RappelsendConfig {
  clientId: string;
  token: string;
  apiUrl?: string;
}

interface SendMessageParams {
  mobile: string;
  text: string;
}

interface SendMessageUrlParams extends SendMessageParams {
  clientId: string;
  token: string;
}

interface RappelsendResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export class RappelsendService {
  private config: RappelsendConfig;
  private baseUrl: string;

  constructor(config: RappelsendConfig) {
    this.config = config;
    this.baseUrl = config.apiUrl || 'https://rappelsend.com/api/user/v2';
  }

  /**
   * שליחת הודעת WhatsApp באמצעות URL parameters (GET method)
   */
  async sendMessageViaUrl(params: SendMessageParams): Promise<RappelsendResponse> {
    const url = `${this.baseUrl}/send_message_url`;
    
    const queryParams = new URLSearchParams({
      client_id: this.config.clientId,
      mobile: this.formatPhoneNumber(params.mobile),
      text: params.text,
      token: this.config.token,
    });

    const apiUrl = `${url}?${queryParams}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Rappelsend URL method error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * שליחת הודעת WhatsApp באמצעות POST request (מומלץ)
   */
  async sendMessage(params: SendMessageParams): Promise<RappelsendResponse> {
    const url = `${this.baseUrl}/send_message`;

    const body = {
      client_id: this.config.clientId,
      mobile: this.formatPhoneNumber(params.mobile),
      text: params.text,
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.token}`,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Rappelsend POST method error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * שליחת הודעת WhatsApp עם תבנית (template)
   * נניח שיש תמיכה בתבניות מאושרות של WhatsApp Business
   */
  async sendTemplateMessage(params: {
    mobile: string;
    templateName: string;
    variables: Record<string, string>;
  }): Promise<RappelsendResponse> {
    // כאן נממש לפי הצורך אם Rappelsend תומך בתבניות
    // לעת עתה נשתמש בשליחת טקסט רגיל
    const text = this.replaceVariables(params.variables);
    
    return this.sendMessage({
      mobile: params.mobile,
      text,
    });
  }

  /**
   * המרת מספר טלפון לפורמט הנדרש
   * @param phone - מספר טלפון בפורמט כלשהו
   * @returns מספר טלפון בפורמט בינלאומי (לדוגמה: 972542284283)
   * 
   * תומך בפורמטים הבאים:
   * - 0542284283 -> 972542284283
   * - 054-2284283 -> 972542284283
   * - 054-228-4283 -> 972542284283
   * - 972542284283 -> 972542284283
   * - +972542284283 -> 972542284283
   * - 972-54-228-4283 -> 972542284283
   */
  private formatPhoneNumber(phone: string): string {
    // הסרת כל התווים שאינם ספרות או +
    let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // הסרת + מההתחלה אם יש
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    // אם מתחיל ב-00972 (פורמט בינלאומי חלופי)
    if (cleaned.startsWith('00972')) {
      cleaned = cleaned.substring(2); // מסיר את 00, משאיר 972
    }
    // אם מתחיל ב-00 אחר (לא ישראל)
    else if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2);
    }
    
    // אם כבר מתחיל ב-972 (קידומת ישראל)
    if (cleaned.startsWith('972')) {
      // וודא שאורך התקין (972 + 9 ספרות = 12 ספרות סה"כ)
      if (cleaned.length >= 12) {
        return cleaned.substring(0, 12); // חותך לאורך מקסימלי
      }
      return cleaned;
    }
    
    // אם מתחיל ב-0 (מספר ישראלי מקומי)
    if (cleaned.startsWith('0')) {
      // הורד את ה-0 והוסף 972
      cleaned = '972' + cleaned.substring(1);
      return cleaned;
    }
    
    // אם המספר הוא 9 ספרות בלי 0 בהתחלה (כנראה ישראלי ללא 0)
    if (cleaned.length === 9 && /^[5-9]/.test(cleaned)) {
      return '972' + cleaned;
    }
    
    // אם המספר לא מתחיל בקידומת בינלאומית והוא 10 ספרות
    // (כנראה שכחו את ה-0)
    if (cleaned.length === 10 && /^[5-9]/.test(cleaned)) {
      return '972' + cleaned;
    }
    
    // במקרים אחרים - אם אין קידומת, נניח שזה ישראלי והוסף 972
    if (!cleaned.match(/^[0-9]{10,}/)) {
      return '972' + cleaned;
    }

    return cleaned;
  }

  /**
   * החלפת משתנים בתבנית
   */
  private replaceVariables(variables: Record<string, string>): string {
    let text = '';
    for (const [key, value] of Object.entries(variables)) {
      text += `${key}: ${value}\n`;
    }
    return text;
  }
}

/**
 * יצירת instance של RappelsendService
 * מנסה לקחת מההגדרות במסד הנתונים, אחרת מ-ENV
 */
export async function createRappelsendService(): Promise<RappelsendService | null> {
  let clientId = process.env.RAPPELSEND_CLIENT_ID;
  let token = process.env.RAPPELSEND_API_TOKEN;

  // ניסיון לטעון מ-DB אם לא קיים ב-ENV
  if (!clientId || !token) {
    try {
      const { prisma } = await import('@/lib/prisma');
      
      const [clientIdSetting, tokenSetting] = await Promise.all([
        prisma.systemSettings.findUnique({
          where: { key: 'rappelsend_client_id' },
        }),
        prisma.systemSettings.findUnique({
          where: { key: 'rappelsend_api_token' },
        }),
      ]);

      clientId = clientIdSetting?.value || clientId;
      token = tokenSetting?.value || token;
    } catch (error) {
      console.error('Error fetching Rappelsend settings from DB:', error);
    }
  }

  if (!clientId || !token) {
    console.warn('Rappelsend credentials not configured in ENV or DB');
    return null;
  }

  return new RappelsendService({
    clientId,
    token,
  });
}

/**
 * נרמול מספר טלפון לפורמט בינלאומי (ציבורי)
 * @param phone - מספר טלפון בכל פורמט
 * @returns מספר טלפון בפורמט 972XXXXXXXXX
 * 
 * דוגמאות:
 * - normalizePhoneNumber('0542284283') => '972542284283'
 * - normalizePhoneNumber('054-228-4283') => '972542284283'
 * - normalizePhoneNumber('+972542284283') => '972542284283'
 * - normalizePhoneNumber('972542284283') => '972542284283'
 */
export function normalizePhoneNumber(phone: string): string {
  // הסרת כל התווים שאינם ספרות או +
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // הסרת + מההתחלה אם יש
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // אם מתחיל ב-00972 (פורמט בינלאומי חלופי)
  if (cleaned.startsWith('00972')) {
    cleaned = cleaned.substring(2); // מסיר את 00, משאיר 972
  }
  // אם מתחיל ב-00 אחר (לא ישראל)
  else if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  
  // אם כבר מתחיל ב-972 (קידומת ישראל)
  if (cleaned.startsWith('972')) {
    // וודא שאורך התקין (972 + 9 ספרות = 12 ספרות סה"כ)
    if (cleaned.length >= 12) {
      return cleaned.substring(0, 12); // חותך לאורך מקסימלי
    }
    return cleaned;
  }
  
  // אם מתחיל ב-0 (מספר ישראלי מקומי)
  if (cleaned.startsWith('0')) {
    // הורד את ה-0 והוסף 972
    cleaned = '972' + cleaned.substring(1);
    return cleaned;
  }
  
  // אם המספר הוא 9 ספרות בלי 0 בהתחלה (כנראה ישראלי ללא 0)
  if (cleaned.length === 9 && /^[5-9]/.test(cleaned)) {
    return '972' + cleaned;
  }
  
  // אם המספר לא מתחיל בקידומת בינלאומית והוא 10 ספרות
  // (כנראה שכחו את ה-0)
  if (cleaned.length === 10 && /^[5-9]/.test(cleaned)) {
    return '972' + cleaned;
  }
  
  // במקרים אחרים - אם אין קידומת, נניח שזה ישראלי והוסף 972
  if (!cleaned.match(/^[0-9]{10,}/)) {
    return '972' + cleaned;
  }

  return cleaned;
}

/**
 * Helper function לשליחת הודעת WhatsApp
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<RappelsendResponse> {
  const service = await createRappelsendService();
  
  if (!service) {
    return {
      success: false,
      error: 'WhatsApp service not configured',
    };
  }

  // נרמול מספר הטלפון לפני שליחה
  const normalizedPhone = normalizePhoneNumber(phone);
  
  console.log(`📱 Sending WhatsApp to: ${phone} => ${normalizedPhone}`);

  return service.sendMessage({
    mobile: normalizedPhone,
    text: message,
  });
}

