'use client';

import { useState } from 'react';
import { Bell, Clock, CheckCircle, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReminderSettingsProps {
  businessId: string;
  initialSettings: {
    reminderEnabled: boolean;
    reminderHoursBefore: number;
    confirmationEnabled: boolean;
    confirmationHoursBefore: number;
  };
}

export function ReminderSettings({ businessId, initialSettings }: ReminderSettingsProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast.success('ההגדרות נשמרו בהצלחה! ✅');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('שגיאה בשמירת ההגדרות');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-blue-900">הגדרות תזכורות והתראות</h3>
          <p className="text-sm text-blue-700">
            קבע מתי לשלוח תזכורות ללקוחות שלך
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-medium mb-1">💡 חשוב לדעת:</p>
          <ul className="list-disc list-inside space-y-1 text-amber-700">
            <li>התזכורות נשלחות אוטומטית בזמן שהגדרת</li>
            <li>הלקוח יקבל תזכורת ב-WhatsApp (אם יש מספר) ובאימייל</li>
            <li>אישור הגעה מאפשר ללקוח לאשר/לבטל את התור</li>
          </ul>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 space-y-6">
        {/* Enable Reminders */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-5 h-5 text-gray-600" />
              <h4 className="font-bold text-lg text-gray-900">תזכורת אוטומטית</h4>
            </div>
            <p className="text-sm text-gray-600">
              שלח תזכורת אוטומטית ללקוחות לפני התור
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.reminderEnabled}
              onChange={(e) => setSettings({ ...settings, reminderEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {settings.reminderEnabled && (
          <div className="pr-7 space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                מתי לשלוח תזכורת?
              </label>
              <select
                value={settings.reminderHoursBefore}
                onChange={(e) => setSettings({ ...settings, reminderHoursBefore: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>שעה לפני התור</option>
                <option value={2}>שעתיים לפני התור</option>
                <option value={3}>3 שעות לפני התור</option>
                <option value={6}>6 שעות לפני התור</option>
                <option value={12}>12 שעות לפני התור</option>
                <option value={24}>יום לפני התור (24 שעות)</option>
                <option value={48}>יומיים לפני התור</option>
                <option value={72}>3 ימים לפני התור</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                התזכורת תישלח {settings.reminderHoursBefore} שעות לפני כל תור
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Settings */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 space-y-6">
        {/* Enable Confirmation */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              <h4 className="font-bold text-lg text-gray-900">אישור הגעה</h4>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">מומלץ</span>
            </div>
            <p className="text-sm text-gray-600">
              בקש מהלקוח לאשר שהוא מגיע לתור (מפחית אי-הופעות)
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.confirmationEnabled}
              onChange={(e) => setSettings({ ...settings, confirmationEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {settings.confirmationEnabled && (
          <div className="pr-7 space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                מתי לבקש אישור הגעה?
              </label>
              <select
                value={settings.confirmationHoursBefore}
                onChange={(e) => setSettings({ ...settings, confirmationHoursBefore: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={2}>שעתיים לפני התור</option>
                <option value={3}>3 שעות לפני התור</option>
                <option value={6}>6 שעות לפני התור</option>
                <option value={12}>12 שעות לפני התור</option>
                <option value={24}>יום לפני התור (24 שעות)</option>
                <option value={48}>יומיים לפני התור</option>
                <option value={72}>3 ימים לפני התור</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                בקשת אישור ההגעה תישלח {settings.confirmationHoursBefore} שעות לפני כל תור
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-800">
                <strong>איך זה עובד?</strong><br />
                הלקוח יקבל הודעה עם כפתורים "מאשר הגעה" או "צריך לבטל"<br />
                אם הלקוח לא מאשר - תקבל התראה
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary px-8"
        >
          {isSaving ? 'שומר...' : 'שמור הגדרות'}
        </button>
      </div>
    </div>
  );
}

