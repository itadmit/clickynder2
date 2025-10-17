'use client';

import { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function SMTPSettingsSection() {
  const [settings, setSettings] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_secure: 'false',
    smtp_user: '',
    smtp_password: '',
    smtp_from_name: 'Clickynder',
    smtp_from_email: '',
    hasPassword: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // טעינת הגדרות קיימות
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/smtp-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/smtp-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success('הגדרות SMTP נשמרו בהצלחה!');
        await loadSettings(); // רענון
      } else {
        const data = await res.json();
        toast.error(data.error || 'שגיאה בשמירת הגדרות');
      }
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      toast.error('שגיאה בשמירת הגדרות');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/admin/smtp-settings', {
        method: 'PUT',
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success('✅ חיבור ל-SMTP הצליח!');
      } else {
        toast.error(`❌ חיבור נכשל: ${data.error}`);
      }
    } catch (error) {
      console.error('Error testing SMTP:', error);
      toast.error('שגיאה בבדיקת חיבור');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500 rounded-lg">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">הגדרות Google SMTP</h2>
          <p className="text-sm text-gray-600">
            פרטי התחברות לשליחת מיילים דרך Gmail
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* SMTP Host */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Host
          </label>
          <input
            type="text"
            value={settings.smtp_host}
            onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="smtp.gmail.com"
          />
        </div>

        {/* SMTP Port & Secure */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Port
            </label>
            <select
              value={settings.smtp_port}
              onChange={(e) => setSettings({ 
                ...settings, 
                smtp_port: e.target.value,
                smtp_secure: e.target.value === '465' ? 'true' : 'false'
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="587">587 (TLS/STARTTLS)</option>
              <option value="465">465 (SSL)</option>
              <option value="25">25 (Plain)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secure Connection
            </label>
            <div className="flex items-center h-[42px] px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <input
                type="checkbox"
                checked={settings.smtp_secure === 'true'}
                onChange={(e) => setSettings({ ...settings, smtp_secure: e.target.checked ? 'true' : 'false' })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="mr-2 text-sm text-gray-700">SSL/TLS</span>
            </div>
          </div>
        </div>

        {/* Email & Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gmail Address
          </label>
          <input
            type="email"
            value={settings.smtp_user}
            onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value, smtp_from_email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your-email@gmail.com"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            App Password {settings.hasPassword && <span className="text-green-600 text-xs">(✓ קיימת)</span>}
          </label>
          <input
            type="password"
            value={settings.smtp_password}
            onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={settings.hasPassword ? "השאר ריק כדי לא לשנות" : "הזן App Password"}
            dir="ltr"
          />
        </div>

        {/* From Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            שם השולח
          </label>
          <input
            type="text"
            value={settings.smtp_from_name}
            onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Clickynder"
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 איך להשיג App Password מ-Gmail:</strong>
            <br />
            1. היכנס ל-
            <a
              href="https://myaccount.google.com/security"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline mx-1"
            >
              Google Account Security
            </a>
            <br />
            2. הפעל אימות דו-שלבי (2-Step Verification)
            <br />
            3. לחץ על "App passwords"
            <br />
            4. צור App Password חדש עבור "Mail"
            <br />
            5. העתק את הסיסמה בת 16 התווים והדבק כאן
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={saving || !settings.smtp_user}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="animate-spin">⏳</span>
                שומר...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                שמור הגדרות
              </>
            )}
          </button>

          <button
            onClick={handleTest}
            disabled={testing}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {testing ? (
              <>
                <span className="animate-spin">⏳</span>
                בודק...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                בדוק חיבור
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

