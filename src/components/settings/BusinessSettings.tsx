'use client';

import { useState } from 'react';
import { Business } from '@prisma/client';
import { Save, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface BusinessSettingsProps {
  business: Business;
}

export function BusinessSettings({ business }: BusinessSettingsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: business.name,
    slug: business.slug,
    timezone: business.timezone,
    currency: business.currency || 'ILS',
  });
  const [slugError, setSlugError] = useState('');

  const handleSlugChange = (value: string) => {
    const slugRegex = /^[a-z0-9-]+$/;
    setFormData((prev) => ({ ...prev, slug: value }));
    
    if (value && !slugRegex.test(value)) {
      setSlugError('השתמש רק באותיות אנגליות קטנות, מספרים ומקפים');
    } else if (value.length < 3) {
      setSlugError('כתובת אתר חייבת להכיל לפחות 3 תווים');
    } else {
      setSlugError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (slugError) {
      toast.error('נא לתקן את השגיאות בטופס');
      return;
    }

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
        throw new Error(errorData.error || 'Failed to update business');
      }

      toast.success('ההגדרות נשמרו בהצלחה');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'אירעה שגיאה בשמירת ההגדרות');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Name */}
      <div>
        <label htmlFor="name" className="form-label">
          שם העסק *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          className="form-input"
          required
        />
      </div>

      {/* Business Slug */}
      <div>
        <label htmlFor="slug" className="form-label flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          כתובת האתר שלך *
        </label>
        <input
          id="slug"
          type="text"
          value={formData.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          className={`form-input ${slugError ? 'border-red-500' : ''}`}
          required
          dir="ltr"
          style={{ textAlign: 'left' }}
        />
        <div className="mt-2">
          {slugError ? (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{slugError}</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-1">
                הלקוחות שלך יוכלו לקבוע תור בכתובת:
              </p>
              <p className="text-sm text-primary-600 font-medium" dir="ltr" style={{ textAlign: 'left' }}>
                clickynder.com/{formData.slug}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timezone */}
        <div>
          <label htmlFor="timezone" className="form-label">
            אזור זמן
          </label>
          <select
            id="timezone"
            value={formData.timezone}
            onChange={(e) => setFormData((prev) => ({ ...prev, timezone: e.target.value }))}
            className="form-input"
          >
            <option value="Asia/Jerusalem">ישראל (Asia/Jerusalem)</option>
            <option value="Europe/London">לונדון (Europe/London)</option>
            <option value="America/New_York">ניו יורק (America/New_York)</option>
          </select>
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="form-label">
            מטבע
          </label>
          <select
            id="currency"
            value={formData.currency}
            onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
            className="form-input"
          >
            <option value="ILS">שקל ישראלי (₪)</option>
            <option value="USD">דולר אמריקאי ($)</option>
            <option value="EUR">יורו (€)</option>
            <option value="GBP">לירה שטרלינג (£)</option>
          </select>
        </div>
      </div>

      {/* Submit */}
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

