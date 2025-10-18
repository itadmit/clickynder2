'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { User, Mail, Phone, Calendar, LogOut, Save, Trash2 } from 'lucide-react';

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: Date;
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setMessage({ type: 'success', text: 'הפרטים עודכנו בהצלחה' });
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'אירעה שגיאה בעדכון הפרטים' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleResetData = async () => {
    if (!confirm('⚠️ אזהרה!\n\nפעולה זו תמחק את כל הנתונים שלך לצמיתות:\n- תורים\n- לקוחות\n- שירותים\n- עובדים\n- סניפים\n\nלאחר המחיקה המערכת תאפס למצב התחלתי.\n\nהאם אתה בטוח שברצונך להמשיך?')) {
      return;
    }

    if (!confirm('האם אתה באמת בטוח? פעולה זו לא ניתנת לביטול!')) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/profile/reset`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset data');
      }

      setMessage({ type: 'success', text: 'כל הנתונים נמחקו בהצלחה. מפנה מחדש...' });
      
      // המתן 2 שניות ואז התנתק
      setTimeout(async () => {
        await signOut({ callbackUrl: '/auth/signin' });
      }, 2000);
    } catch (error) {
      console.error('Error resetting data:', error);
      setMessage({ type: 'error', text: 'אירעה שגיאה במחיקת הנתונים' });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Info Card */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          פרטים אישיים
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="form-label">
              שם מלא
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="form-input !pr-10"
                required
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="form-label">
              אימייל
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={user.email}
                className="form-input !pr-10 bg-gray-50 cursor-not-allowed"
                disabled
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">לא ניתן לשנות את כתובת האימייל</p>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="form-label">
              טלפון
            </label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="form-input !pr-10"
                placeholder="050-1234567"
              />
            </div>
          </div>

          {/* Member Since */}
          <div>
            <label className="form-label">חבר מאז</label>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={new Date(user.createdAt).toLocaleDateString('he-IL')}
                className="form-input !pr-10 bg-gray-50 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Buttons - בשורה אחת */}
          <div className="flex gap-3">
            <button 
              type="submit" 
              className="btn btn-primary flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>שומר...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>שמור שינויים</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="btn bg-gray-600 text-white hover:bg-gray-700 flex-1"
              disabled={isLoading}
            >
              <LogOut className="w-5 h-5" />
              <span>התנתק</span>
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone - Reset Data */}
      <div className="card p-6 border-2 border-red-300 bg-red-50">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700">
          <Trash2 className="w-5 h-5" />
          אזור מסוכן
        </h2>
        <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
          <p className="text-gray-700 mb-2 font-semibold">
            מחק את כל התוכן ואפס למצב התחלתי
          </p>
          <p className="text-sm text-gray-600">
            פעולה זו תמחק לצמיתות את כל הנתונים: תורים, לקוחות, שירותים, עובדים וסניפים.
            המערכת תחזור למצב התחלתי כאילו נרשמת עכשיו.
          </p>
        </div>
        <button
          onClick={handleResetData}
          className="btn bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto"
          disabled={isLoading}
        >
          <Trash2 className="w-5 h-5" />
          <span>מחק את כל הנתונים</span>
        </button>
      </div>
    </div>
  );
}


