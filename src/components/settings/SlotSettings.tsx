'use client';

import { useState } from 'react';
import { SlotPolicy } from '@prisma/client';
import { Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface SlotSettingsProps {
  businessId: string;
  slotPolicy: SlotPolicy | null;
}

export function SlotSettings({ businessId, slotPolicy }: SlotSettingsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    defaultDurationMin: slotPolicy?.defaultDurationMin || 30,
    defaultGapMin: slotPolicy?.defaultGapMin || 0,
    advanceWindowDays: slotPolicy?.advanceWindowDays || 30,
    sameDayBooking: slotPolicy?.sameDayBooking ?? true,
    roundingStrategy: slotPolicy?.roundingStrategy || 'continuous',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/businesses/slot-policy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update slot policy');
      }

      toast.success('הגדרות הזמני פגישות נשמרו בהצלחה');
      router.refresh();
    } catch (error) {
      toast.error('אירעה שגיאה בשמירת ההגדרות');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Default Duration */}
        <div>
          <label htmlFor="defaultDurationMin" className="form-label">
            משך פגישה ברירת מחדל (דקות)
          </label>
          <input
            id="defaultDurationMin"
            type="number"
            min="5"
            step="5"
            value={formData.defaultDurationMin}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                defaultDurationMin: parseInt(e.target.value),
              }))
            }
            className="form-input"
          />
        </div>

        {/* Default Gap */}
        <div>
          <label htmlFor="defaultGapMin" className="form-label">
            מרווח בין פגישות (דקות)
          </label>
          <input
            id="defaultGapMin"
            type="number"
            min="0"
            step="5"
            value={formData.defaultGapMin}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                defaultGapMin: parseInt(e.target.value),
              }))
            }
            className="form-input"
          />
          <p className="text-xs text-gray-500 mt-1">
            זמן להפסקה בין לקוחות
          </p>
        </div>
      </div>

      {/* Advance Window */}
      <div>
        <label htmlFor="advanceWindowDays" className="form-label">
          טווח זמן זמין להזמנה מראש (ימים)
        </label>
        <input
          id="advanceWindowDays"
          type="number"
          min="1"
          max="365"
          value={formData.advanceWindowDays}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              advanceWindowDays: parseInt(e.target.value),
            }))
          }
          className="form-input max-w-xs"
        />
        <p className="text-xs text-gray-500 mt-1">
          כמה ימים קדימה לקוחות יכולים להזמין
        </p>
      </div>

      {/* Rounding Strategy */}
      <div>
        <label htmlFor="roundingStrategy" className="form-label">
          אסטרטגיית חישוב זמנים
        </label>
        <select
          id="roundingStrategy"
          value={formData.roundingStrategy}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              roundingStrategy: e.target.value as any,
            }))
          }
          className="form-input"
        >
          <option value="continuous">רצף (כל 15 דקות)</option>
          <option value="on_the_hour">לפי שעה עגולה בלבד</option>
          <option value="every_15">כל רבע שעה</option>
          <option value="every_30">כל חצי שעה</option>
        </select>
      </div>

      {/* Same Day Booking */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.sameDayBooking}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sameDayBooking: e.target.checked,
              }))
            }
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm font-medium">אפשר הזמנה באותו יום</span>
        </label>
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
            <span>שמור הגדרות</span>
          </>
        )}
      </button>
    </form>
  );
}

