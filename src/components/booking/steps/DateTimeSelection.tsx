'use client';

import { useState, useEffect } from 'react';
import { Calendar, ArrowRight, Clock } from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import { he } from 'date-fns/locale';

interface DateTimeSelectionProps {
  businessId: string;
  branchId?: string;
  serviceId: string;
  staffId?: string;
  serviceDurationMin?: number;
  onSelect: (date: string, time: string) => void;
  onBack: () => void;
}

export function DateTimeSelection({
  businessId,
  branchId,
  serviceId,
  staffId,
  serviceDurationMin,
  onSelect,
  onBack,
}: DateTimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Format time slot as range (e.g., "08:00-08:30")
  const formatTimeSlot = (startTime: string, durationMin: number = 30) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = minutes + durationMin;
    const endHours = hours + Math.floor(endMinutes / 60);
    const finalMinutes = endMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
    return `${startTime}-${endTime}`;
  };

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfDay(new Date()), i);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEEE, d בMMMM', { locale: he }),
    };
  });

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (date: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        businessId,
        serviceId,
        date,
        ...(branchId && { branchId }),
        ...(staffId && { staffId }),
      });

      const response = await fetch(`/api/appointments/slots?${params}`);
      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">בחר תאריך ושעה</h2>
      <p className="text-gray-600 mb-6">מתי נוח לך להגיע?</p>

      {/* Date Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">תאריך</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {dates.map((date) => (
            <button
              key={date.value}
              onClick={() => setSelectedDate(date.value)}
              className={`
                p-3 rounded-lg border-2 text-sm transition-all
                hover:border-primary-500
                ${
                  selectedDate === date.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{date.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-medium mb-2">שעה</label>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto" />
              <p className="text-gray-500 mt-4">טוען שעות פנויות...</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">אין שעות פנויות בתאריך זה</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => onSelect(selectedDate, slot)}
                  className="p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center font-medium"
                >
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{formatTimeSlot(slot, serviceDurationMin)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={onBack}
        className="mt-6 btn btn-secondary flex items-center gap-2"
      >
        <ArrowRight className="w-5 h-5" />
        <span>חזרה</span>
      </button>
    </div>
  );
}

