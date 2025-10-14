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
   * @returns מספר טלפון בפורמט בינלאומי (לדוגמה: 972501234567)
   */
  private formatPhoneNumber(phone: string): string {
    // הסרת תווים מיוחדים
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // אם מתחיל ב-0, מחליפים ל-972 (ישראל)
    if (cleaned.startsWith('0')) {
      cleaned = '972' + cleaned.substring(1);
    }
    
    // אם לא מתחיל בקידומת בינלאומית, מוסיפים 972
    if (!cleaned.match(/^[0-9]{10,}$/)) {
      cleaned = '972' + cleaned;
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
 */
export function createRappelsendService(): RappelsendService | null {
  const clientId = process.env.RAPPELSEND_CLIENT_ID;
  const token = process.env.RAPPELSEND_API_TOKEN;

  if (!clientId || !token) {
    console.warn('Rappelsend credentials not configured');
    return null;
  }

  return new RappelsendService({
    clientId,
    token,
  });
}

/**
 * Helper function לשליחת הודעת WhatsApp
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<RappelsendResponse> {
  const service = createRappelsendService();
  
  if (!service) {
    return {
      success: false,
      error: 'WhatsApp service not configured',
    };
  }

  return service.sendMessage({
    mobile: phone,
    text: message,
  });
}

