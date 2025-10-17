'use client';

import { useState } from 'react';
import { NotificationTemplate } from '@prisma/client';
import { Mail, MessageSquare, Phone, Edit2, Eye, Save, X, Check, Power, EyeOff } from 'lucide-react';

interface NotificationSettingsProps {
  businessId: string;
  templates: NotificationTemplate[];
}

export function NotificationSettings({ businessId, templates }: NotificationSettingsProps) {
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localTemplates, setLocalTemplates] = useState(templates);
  const [creatingDefaults, setCreatingDefaults] = useState(false);
  const [previewingTemplate, setPreviewingTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email'>('whatsapp');

  // סינון תבניות לפי ערוץ
  const whatsappTemplates = localTemplates.filter((t) => t.channel === 'whatsapp');
  const emailTemplates = localTemplates.filter((t) => t.channel === 'email');
  
  // תבניות מוצגות לפי הטאב הפעיל
  const displayedTemplates = activeTab === 'whatsapp' ? whatsappTemplates : emailTemplates;

  const startEditing = (template: NotificationTemplate) => {
    setEditingTemplate(template.id);
    setEditedSubject(template.subject || '');
    setEditedBody(template.body);
    setShowPreview(false);
  };

  const cancelEditing = () => {
    setEditingTemplate(null);
    setEditedSubject('');
    setEditedBody('');
    setShowPreview(false);
  };

  const saveTemplate = async (templateId: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/notifications/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: editedSubject || null,
          body: editedBody,
        }),
      });

      if (!response.ok) throw new Error('Failed to save template');

      const updatedTemplate = await response.json();
      setLocalTemplates((prev) =>
        prev.map((t) => (t.id === templateId ? updatedTemplate : t))
      );

      cancelEditing();
      alert('התבנית נשמרה בהצלחה! ✅');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('שגיאה בשמירת התבנית');
    } finally {
      setSaving(false);
    }
  };

  const toggleTemplateActive = async (templateId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/notifications/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active: !currentActive,
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle template');

      const updatedTemplate = await response.json();
      setLocalTemplates((prev) =>
        prev.map((t) => (t.id === templateId ? updatedTemplate : t))
      );
    } catch (error) {
      console.error('Error toggling template:', error);
      alert('שגיאה בשינוי סטטוס התבנית');
    }
  };

  const createDefaultTemplates = async () => {
    setCreatingDefaults(true);
    try {
      const response = await fetch('/api/notifications/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create templates');
      }

      const result = await response.json();
      setLocalTemplates(result.templates);
      alert(`נוצרו ${result.count} תבניות ברירת מחדל בהצלחה! ✅`);
    } catch (error: any) {
      console.error('Error creating default templates:', error);
      alert(error.message || 'שגיאה ביצירת תבניות');
    } finally {
      setCreatingDefaults(false);
    }
  };

  const getPreviewText = (text: string) => {
    const exampleData = {
      '{customer_name}': 'ישראל ישראלי',
      '{business_name}': 'העסק שלי',
      '{service_name}': 'תספורת גברים',
      '{staff_name}': 'דני המספר',
      '{branch_name}': 'סניף תל אביב',
      '{appointment_date}': '15/10/2025',
      '{appointment_time}': '10:00',
      '{confirmation_code}': 'ABC123',
    };

    let preview = text;
    Object.entries(exampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    return preview;
  };

  const togglePreview = (templateId: string) => {
    if (previewingTemplate === templateId) {
      setPreviewingTemplate(null);
    } else {
      setPreviewingTemplate(templateId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'whatsapp'
                ? 'border-green-500 text-green-700 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
              {whatsappTemplates.some(t => t.active) && (
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  פעיל
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'email'
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>אימייל</span>
              {emailTemplates.some(t => t.active) && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  פעיל
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Channel Info */}
      {activeTab === 'whatsapp' ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-green-900">הודעות WhatsApp דרך RappelSend</h3>
            <p className="text-sm text-green-700">
              נהל את תבניות ההודעות שנשלחות ללקוחות שלך בוואטסאפ
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900">הודעות אימייל דרך SMTP</h3>
            <p className="text-sm text-blue-700">
              נהל את תבניות האימייל שנשלחות ללקוחות שלך. שים לב: נדרש הגדרת SMTP בפאנל האדמין
            </p>
          </div>
        </div>
      )}

      {/* Templates Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>משתנים זמינים:</strong> {'{customer_name}'}, {'{business_name}'}, 
          {' {service_name}'}, {'{staff_name}'}, {'{branch_name}'}, {'{appointment_date}'}, 
          {'{appointment_time}'}, {'{confirmation_code}'}
        </p>
        <p className="text-xs text-blue-600 mt-2">
          💡 טיפ: השתמש במשתנים אלה בתבניות שלך - הם יוחלפו אוטומטית בנתונים אמיתיים בעת שליחת ההודעה
        </p>
      </div>

      {/* Template List */}
      {displayedTemplates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl border-2 border-dashed border-gray-300">
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                activeTab === 'whatsapp' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {activeTab === 'whatsapp' ? (
                  <MessageSquare className="w-8 h-8 text-green-600" />
                ) : (
                  <Mail className="w-8 h-8 text-blue-600" />
                )}
              </div>
            </div>
            <p className="text-lg font-medium mb-2 text-gray-900">
              אין תבניות {activeTab === 'whatsapp' ? 'WhatsApp' : 'אימייל'}
            </p>
            <p className="text-sm mb-6 text-gray-600">
              התבניות נוצרות אוטומטית בעת יצירת חשבון חדש.
              <br />
              נראה שיש בעיה - צור תבניות ברירת מחדל עכשיו.
            </p>
            <div className="relative group inline-block">
              <button
                onClick={createDefaultTemplates}
                disabled={creatingDefaults}
                className={`px-6 py-3 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg ${
                  activeTab === 'whatsapp'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {creatingDefaults ? 'יוצר תבניות...' : `🎨 צור תבניות ${activeTab === 'whatsapp' ? 'WhatsApp' : 'אימייל'}`}
              </button>
              {!creatingDefaults && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  יצירת תבניות מוכנות לשימוש - ניתן לערוך לאחר מכן
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedTemplates.map((template) => {
            const isEditing = editingTemplate === template.id;

            return (
              <div
                key={template.id}
                className={`p-4 border rounded-lg transition-all ${
                  isEditing
                    ? 'border-primary-500 bg-primary-50/30 shadow-md'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-lg">{getEventLabel(template.event)}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                        template.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      {template.active ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </div>

                  {!isEditing && (
                    <div className="flex gap-2">
                      {/* Preview Button */}
                      <div className="relative group">
                        <button
                          onClick={() => togglePreview(template.id)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        >
                          {previewingTemplate === template.id ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {previewingTemplate === template.id ? 'הסתר תצוגה מקדימה' : 'הצג תצוגה מקדימה עם דוגמאות'}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>

                      {/* Toggle Active Button */}
                      <div className="relative group">
                        <button
                          onClick={() => toggleTemplateActive(template.id, template.active)}
                          className={`p-2 rounded-lg transition-colors ${
                            template.active
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                              : 'bg-green-100 hover:bg-green-200 text-green-600'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {template.active ? 'השבת תבנית - לא ישלחו הודעות' : 'הפעל תבנית - תתחיל לשלוח הודעות'}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <div className="relative group">
                        <button
                          onClick={() => startEditing(template)}
                          className="p-2 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          ערוך תוכן התבנית והתאם אישית
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    {/* Subject Field - Email only */}
                    {activeTab === 'email' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          נושא המייל
                        </label>
                        <input
                          type="text"
                          value={editedSubject}
                          onChange={(e) => setEditedSubject(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="נושא האימייל..."
                          dir="rtl"
                        />
                      </div>
                    )}
                    
                    {/* Body Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {activeTab === 'email' ? 'תוכן האימייל (HTML)' : 'תוכן ההודעה'}
                      </label>
                      <textarea
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                        rows={activeTab === 'email' ? 12 : 6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                        placeholder={activeTab === 'email' ? 'כתוב את תוכן האימייל כאן (HTML)...' : 'כתוב את תוכן ההודעה כאן...'}
                        dir="ltr"
                      />
                    </div>

                    {/* Preview Toggle */}
                    <div className="relative group inline-block">
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        {showPreview ? 'הסתר תצוגה מקדימה' : 'הצג תצוגה מקדימה'}
                      </button>
                      <div className="absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        ראה איך ההודעה תיראה עם נתונים אמיתיים
                        <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>

                    {/* Preview Box */}
                    {showPreview && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-2 font-medium">
                          תצוגה מקדימה (עם דוגמאות):
                        </p>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          {editedSubject && (
                            <p className="font-semibold mb-2 text-gray-900">
                              {editedSubject.replace(/{([^}]+)}/g, (_, key) => {
                                const examples: Record<string, string> = {
                                  customer_name: 'ישראל ישראלי',
                                  business_name: 'העסק שלי',
                                  service_name: 'תספורת גברים',
                                  staff_name: 'דני המספר',
                                  branch_name: 'סניף תל אביב',
                                  appointment_date: '15/10/2025',
                                  appointment_time: '10:00',
                                  confirmation_code: 'ABC123',
                                };
                                return examples[key] || `{${key}}`;
                              })}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap text-sm text-gray-800">
                            {getPreviewText(editedBody)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {/* Save Button */}
                      <div className="relative group">
                        <button
                          onClick={() => saveTemplate(template.id)}
                          disabled={saving || !editedBody.trim()}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'שומר...' : 'שמור שינויים'}
                        </button>
                        {!saving && editedBody.trim() && (
                          <div className="absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            שמור את השינויים - התבנית המעודכנת תשלח ללקוחות
                            <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </div>

                      {/* Cancel Button */}
                      <div className="relative group">
                        <button
                          onClick={cancelEditing}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          ביטול
                        </button>
                        {!saving && (
                          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            בטל עריכה וחזור לתצוגה הרגילה
                            <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Subject (Email only) */}
                    {activeTab === 'email' && template.subject && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">נושא האימייל:</p>
                        <p className="text-sm font-semibold bg-blue-50 p-3 rounded border border-blue-200 text-gray-800">
                          {template.subject}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {activeTab === 'email' ? 'תוכן האימייל:' : 'תוכן הודעת WhatsApp:'}
                      </p>
                      <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200 text-gray-800 font-mono text-xs max-h-60 overflow-y-auto">
                        {template.body}
                      </p>
                    </div>

                    {/* Preview for non-editing mode */}
                    {previewingTemplate === template.id && (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-xs text-green-700 mb-2 font-medium flex items-center gap-2">
                          <Eye className="w-3 h-3" />
                          תצוגה מקדימה (עם דוגמאות):
                        </p>
                        <div className="bg-white p-3 rounded border border-green-200">
                          <p className="whitespace-pre-wrap text-sm text-gray-800">
                            {getPreviewText(template.body)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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

