'use client';

import { useState } from 'react';
import { NotificationTemplate } from '@prisma/client';
import { Mail, MessageSquare, Phone } from 'lucide-react';

interface NotificationSettingsProps {
  businessId: string;
  templates: NotificationTemplate[];
}

export function NotificationSettings({ businessId, templates }: NotificationSettingsProps) {
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'sms' | 'whatsapp'>('whatsapp');

  const channelTemplates = templates.filter((t) => t.channel === selectedChannel);

  return (
    <div className="space-y-6">
      {/* Channel Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setSelectedChannel('whatsapp')}
          className={`
            flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
            ${
              selectedChannel === 'whatsapp'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }
          `}
        >
          <MessageSquare className="w-5 h-5" />
          <span>WhatsApp</span>
        </button>

        <button
          onClick={() => setSelectedChannel('sms')}
          className={`
            flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
            ${
              selectedChannel === 'sms'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }
          `}
        >
          <Phone className="w-5 h-5" />
          <span>SMS</span>
        </button>

        <button
          onClick={() => setSelectedChannel('email')}
          className={`
            flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
            ${
              selectedChannel === 'email'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }
          `}
        >
          <Mail className="w-5 h-5" />
          <span>אימייל</span>
        </button>
      </div>

      {/* Templates Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>משתנים זמינים:</strong> {'{customer_name}'}, {'{business_name}'}, 
          {' {service_name}'}, {'{staff_name}'}, {'{appointment_date}'}, 
          {'{appointment_time}'}, {'{confirmation_code}'}
        </p>
      </div>

      {/* Template List */}
      {channelTemplates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>אין תבניות התראה עבור ערוץ זה</p>
          <p className="text-sm mt-2">תבניות יווצרו אוטומטית בשימוש ראשון</p>
        </div>
      ) : (
        <div className="space-y-4">
          {channelTemplates.map((template) => (
            <div key={template.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">{getEventLabel(template.event)}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      template.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {template.active ? 'פעיל' : 'לא פעיל'}
                  </span>
                </div>
              </div>

              {template.subject && (
                <div className="mb-2">
                  <p className="text-xs text-gray-600">נושא:</p>
                  <p className="text-sm">{template.subject}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-600">תוכן:</p>
                <p className="text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">
                  {template.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getEventLabel(event: string): string {
  const labels: Record<string, string> = {
    booking_confirmed: 'אישור הזמנה',
    booking_reminder: 'תזכורת לתור',
    booking_canceled: 'ביטול תור',
    booking_rescheduled: 'שינוי מועד',
    admin_new_booking: 'הודעה לעסק על תור חדש',
  };
  return labels[event] || event;
}

