'use client';

import { useState, useEffect } from 'react';
import { Business } from '@prisma/client';
import { Save, Link as LinkIcon, AlertCircle, Check, Loader2, XCircle } from 'lucide-react';
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
    address: business.address || '',
    timezone: business.timezone,
    currency: business.currency || 'ILS',
  });
  const [slugError, setSlugError] = useState('');
  const [slugCheckStatus, setSlugCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugCheckTimeout, setSlugCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (slugCheckTimeout) {
        clearTimeout(slugCheckTimeout);
      }
    };
  }, [slugCheckTimeout]);

  // Check slug availability
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugCheckStatus('idle');
      return;
    }

    // אם הסלאג לא השתנה מהמקורי, לא צריך לבדוק
    if (slug === business.slug) {
      setSlugCheckStatus('idle');
      return;
    }

    // Validate format first
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugCheckStatus('idle');
      return;
    }

    setSlugCheckStatus('checking');

    try {
      const response = await fetch(`/api/businesses/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();

      if (response.ok) {
        setSlugCheckStatus(data.available ? 'available' : 'taken');
      } else {
        setSlugCheckStatus('idle');
      }
    } catch (error) {
      console.error('Error checking slug:', error);
      setSlugCheckStatus('idle');
    }
  };

  const handleSlugChange = (value: string) => {
    // Remove Hebrew characters and any non-allowed characters
    const filteredValue = value
      .replace(/[\u0590-\u05FF]/g, '') // Remove Hebrew
      .replace(/[^a-z0-9-]/g, '') // Keep only lowercase English, numbers, and hyphens
      .toLowerCase();
    
    setFormData((prev) => ({ ...prev, slug: filteredValue }));
    
    if (filteredValue && !/^[a-z0-9-]+$/.test(filteredValue)) {
      setSlugError('השתמש רק באותיות אנגליות קטנות, מספרים ומקפים');
      setSlugCheckStatus('idle');
    } else if (filteredValue.length < 3) {
      setSlugError('כתובת אתר חייבת להכיל לפחות 3 תווים');
      setSlugCheckStatus('idle');
    } else {
      setSlugError('');
      
      // Clear previous timeout
      if (slugCheckTimeout) {
        clearTimeout(slugCheckTimeout);
      }

      // Set new timeout for checking
      const timeout = setTimeout(() => {
        checkSlugAvailability(filteredValue);
      }, 500); // Wait 500ms after user stops typing

      setSlugCheckTimeout(timeout);
      setSlugCheckStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (slugError) {
      toast.error('נא לתקן את השגיאות בטופס');
      return;
    }

    if (slugCheckStatus === 'taken') {
      toast.error('הכתובת תפוסה, אנא בחר כתובת אחרת');
      return;
    }

    if (slugCheckStatus === 'checking') {
      toast.error('אנא המתן לבדיקת זמינות הכתובת');
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
          כתובת האתר שלך (Slug) *
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className={`form-input w-full pr-10 ${
                slugError 
                  ? 'border-red-500' 
                  : slugCheckStatus === 'available' && formData.slug !== business.slug
                  ? 'border-green-500' 
                  : slugCheckStatus === 'taken'
                  ? 'border-red-500'
                  : ''
              }`}
              required
              dir="ltr"
              placeholder="my-business"
            />
            {/* Status Icon inside input - right side */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {slugCheckStatus === 'checking' && (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              )}
              {slugCheckStatus === 'available' && formData.slug !== business.slug && (
                <Check className="w-5 h-5 text-green-500 font-bold" />
              )}
              {slugCheckStatus === 'taken' && (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
          <span className="text-gray-500 text-sm whitespace-nowrap">/clickynder.com</span>
        </div>
        
        {/* Status Messages */}
        <div className="mt-2">
          {slugCheckStatus === 'available' && formData.slug !== business.slug && !slugError && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check className="w-4 h-4" />
              <span>הכתובת פנויה</span>
            </div>
          )}
          {slugCheckStatus === 'taken' && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <XCircle className="w-4 h-4" />
              <span>הכתובת תפוסה</span>
            </div>
          )}
          {slugError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{slugError}</span>
            </div>
          )}
          {!slugError && slugCheckStatus !== 'available' && slugCheckStatus !== 'taken' && (
            <>
              <p className="text-sm text-gray-600 mb-1">
                הלקוחות שלך יוכלו לקבוע תור בכתובת:
              </p>
              <p className="text-sm text-primary-600 font-medium" dir="ltr">
                clickynder.com/{formData.slug}
              </p>
            </>
          )}
          {!slugError && slugCheckStatus === 'available' && formData.slug !== business.slug && (
            <p className="text-xs text-gray-500 mt-1">רק אותיות אנגליות קטנות, מספרים ומקפים</p>
          )}
        </div>
      </div>

      {/* Business Address */}
      <div>
        <label htmlFor="address" className="form-label">
          כתובת העסק
        </label>
        <input
          id="address"
          type="text"
          value={formData.address}
          onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
          className="form-input"
          placeholder="רחוב, מספר, עיר"
        />
        <p className="mt-1 text-sm text-gray-500">
          כתובת זו תשמש כברירת מחדל לסניפים חדשים
        </p>
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

