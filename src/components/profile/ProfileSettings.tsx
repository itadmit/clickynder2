'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { User, Mail, Phone, Calendar, LogOut, Save } from 'lucide-react';

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
                className="form-input pr-10"
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
                className="form-input pr-10 bg-gray-50 cursor-not-allowed"
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
                className="form-input pr-10"
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
                className="form-input pr-10 bg-gray-50 cursor-not-allowed"
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

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
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
        </form>
      </div>

      {/* Logout Card */}
      <div className="card p-6 border-red-200">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
          <LogOut className="w-5 h-5" />
          יציאה מהחשבון
        </h2>
        <p className="text-gray-600 mb-4">
          לחץ על הכפתור למטה כדי להתנתק מהחשבון שלך
        </p>
        <button
          onClick={handleLogout}
          className="btn bg-red-600 text-white hover:bg-red-700"
        >
          <LogOut className="w-5 h-5" />
          <span>התנתק</span>
        </button>
      </div>
    </div>
  );
}


