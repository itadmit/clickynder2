'use client';

import { useState } from 'react';
import { BusinessHours } from '@prisma/client';
import { Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getDayName } from '@/lib/utils';

interface WorkingHoursProps {
  businessId: string;
  businessHours: BusinessHours[];
}

interface DayHours {
  weekday: number;
  openTime: string;
  closeTime: string;
  active: boolean;
}

export function WorkingHours({ businessId, businessHours }: WorkingHoursProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize with existing hours or defaults
  const [hours, setHours] = useState<DayHours[]>(() => {
    const days: DayHours[] = [];
    for (let i = 0; i < 7; i++) {
      const existingHour = businessHours.find((h) => h.weekday === i);
      days.push({
        weekday: i,
        openTime: existingHour?.openTime || '08:00',
        closeTime: existingHour?.closeTime || '17:00',
        active: existingHour?.active ?? (i < 5), // Default: Sunday-Thursday active
      });
    }
    return days;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/businesses/hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          hours,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update hours');
      }

      toast.success('שעות העבודה נשמרו בהצלחה');
      router.refresh();
    } catch (error) {
      toast.error('אירעה שגיאה בשמירת שעות העבודה');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToAll = (dayIndex: number) => {
    const sourceDayData = hours[dayIndex];
    setHours((prev) =>
      prev.map((day) =>
        day.weekday === dayIndex
          ? day
          : {
              ...day,
              openTime: sourceDayData.openTime,
              closeTime: sourceDayData.closeTime,
              active: sourceDayData.active,
            }
      )
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-3 px-4">יום</th>
              <th className="text-right py-3 px-4">שעת פתיחה</th>
              <th className="text-right py-3 px-4">שעת סגירה</th>
              <th className="text-center py-3 px-4">פעיל</th>
              <th className="text-center py-3 px-4">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((day, index) => (
              <tr key={day.weekday} className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">{getDayName(day.weekday)}</td>
                <td className="py-3 px-4">
                  <input
                    type="time"
                    value={day.openTime}
                    onChange={(e) =>
                      setHours((prev) =>
                        prev.map((d) =>
                          d.weekday === day.weekday
                            ? { ...d, openTime: e.target.value }
                            : d
                        )
                      )
                    }
                    disabled={!day.active}
                    className="form-input w-32"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="time"
                    value={day.closeTime}
                    onChange={(e) =>
                      setHours((prev) =>
                        prev.map((d) =>
                          d.weekday === day.weekday
                            ? { ...d, closeTime: e.target.value }
                            : d
                        )
                      )
                    }
                    disabled={!day.active}
                    className="form-input w-32"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={day.active}
                    onChange={(e) =>
                      setHours((prev) =>
                        prev.map((d) =>
                          d.weekday === day.weekday
                            ? { ...d, active: e.target.checked }
                            : d
                        )
                      )
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleCopyToAll(index)}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    העתק לכולם
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            <span>שמור שעות עבודה</span>
          </>
        )}
      </button>
    </form>
  );
}

