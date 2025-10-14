'use client';

import { useState } from 'react';
import { Business } from '@prisma/client';
import { Save, Phone, Mail, MessageCircle, Facebook, Instagram, Twitter, Youtube, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ContactSettingsProps {
  business: Business;
}

export function ContactSettings({ business }: ContactSettingsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    phone: business.phone || '',
    email: business.email || '',
    facebookUrl: business.facebookUrl || '',
    instagramUrl: business.instagramUrl || '',
    twitterUrl: business.twitterUrl || '',
    youtubeUrl: business.youtubeUrl || '',
    whatsappNumber: business.whatsappNumber || '',
    telegramUrl: business.telegramUrl || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/businesses/${business.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update contact info');
      }

      toast.success('פרטי התקשרות נשמרו בהצלחה');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'אירעה שגיאה בשמירת הפרטים');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact Info Section */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary-600" />
          פרטי התקשרות בסיסיים
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone */}
          <div>
            <label htmlFor="phone" className="form-label">
              טלפון עסקי
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="form-input"
              placeholder="050-123-4567"
            />
            <p className="text-xs text-gray-500 mt-1">יוצג בעמוד קביעת התורים</p>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="form-label">
              אימייל עסקי
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="form-input"
              placeholder="info@business.com"
            />
            <p className="text-xs text-gray-500 mt-1">יוצג בעמוד קביעת התורים</p>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary-600" />
          רשתות חברתיות
        </h3>
        <div className="space-y-4">
          {/* Facebook */}
          <div>
            <label htmlFor="facebook" className="form-label flex items-center gap-2">
              <Facebook className="w-4 h-4 text-blue-600" />
              Facebook
            </label>
            <input
              id="facebook"
              type="url"
              value={formData.facebookUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, facebookUrl: e.target.value }))}
              className="form-input"
              placeholder="https://facebook.com/your-page"
              dir="ltr"
            />
          </div>

          {/* Instagram */}
          <div>
            <label htmlFor="instagram" className="form-label flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-600" />
              Instagram
            </label>
            <input
              id="instagram"
              type="url"
              value={formData.instagramUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, instagramUrl: e.target.value }))}
              className="form-input"
              placeholder="https://instagram.com/your-page"
              dir="ltr"
            />
          </div>

          {/* Twitter / X */}
          <div>
            <label htmlFor="twitter" className="form-label flex items-center gap-2">
              <Twitter className="w-4 h-4 text-sky-500" />
              Twitter / X
            </label>
            <input
              id="twitter"
              type="url"
              value={formData.twitterUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, twitterUrl: e.target.value }))}
              className="form-input"
              placeholder="https://twitter.com/your-page"
              dir="ltr"
            />
          </div>

          {/* YouTube */}
          <div>
            <label htmlFor="youtube" className="form-label flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-600" />
              YouTube
            </label>
            <input
              id="youtube"
              type="url"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
              className="form-input"
              placeholder="https://youtube.com/@your-channel"
              dir="ltr"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="form-label flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-600" />
              WhatsApp
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
              className="form-input"
              placeholder="972501234567"
            />
            <p className="text-xs text-gray-500 mt-1">מספר במבנה בינלאומי (ללא + או 0)</p>
          </div>

          {/* Telegram */}
          <div>
            <label htmlFor="telegram" className="form-label flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-500" />
              Telegram
            </label>
            <input
              id="telegram"
              type="url"
              value={formData.telegramUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, telegramUrl: e.target.value }))}
              className="form-input"
              placeholder="https://t.me/your-channel"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary flex items-center gap-2"
      >
        {isSubmitting ? (
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
  );
}

