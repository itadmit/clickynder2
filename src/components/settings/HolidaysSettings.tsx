'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDate } from 'date-fns';
import { he } from 'date-fns/locale';

interface Holiday {
  id: string;
  date: string;
  name: string;
  isRecurring: boolean;
}

interface HolidaysSettingsProps {
  businessId: string;
}

// חגים ישראליים נפוצים (תאריכים משתנים - רק לדוגמה)
const ISRAELI_HOLIDAYS = [
  { name: 'ראש השנה (יום א\')', month: 9, day: 16, isRecurring: true },
  { name: 'ראש השנה (יום ב\')', month: 9, day: 17, isRecurring: true },
  { name: 'יום כיפור', month: 9, day: 25, isRecurring: true },
  { name: 'סוכות', month: 9, day: 30, isRecurring: true },
  { name: 'שמחת תורה', month: 10, day: 7, isRecurring: true },
  { name: 'פסח (יום א\')', month: 4, day: 15, isRecurring: true },
  { name: 'שביעי של פסח', month: 4, day: 21, isRecurring: true },
  { name: 'שבועות', month: 6, day: 5, isRecurring: true },
  { name: 'יום העצמאות', month: 5, day: 5, isRecurring: true },
];

export function HolidaysSettings({ businessId }: HolidaysSettingsProps) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    name: '',
    isRecurring: false,
  });

  useEffect(() => {
    fetchHolidays();
  }, [businessId]);

  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/time-off?businessId=${businessId}&scope=business`);
      if (response.ok) {
        const data = await response.json();
        setHolidays(data);
      }
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.name) {
      toast.error('נא למלא שם ותאריך');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/time-off/${editingId}` : '/api/time-off';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          scope: 'business',
          startAt: formData.date,
          endAt: formData.date,
          reason: formData.name,
          isRecurring: formData.isRecurring,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save holiday');
      }

      toast.success(editingId ? 'החג עודכן בהצלחה' : 'החג נוסף בהצלחה');
      setFormData({ date: '', name: '', isRecurring: false });
      setEditingId(null);
      fetchHolidays();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'אירעה שגיאה');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingId(holiday.id);
    setFormData({
      date: holiday.date.split('T')[0],
      name: holiday.name,
      isRecurring: holiday.isRecurring,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק חג זה?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/time-off/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete holiday');
      }

      toast.success('החג נמחק בהצלחה');
      fetchHolidays();
    } catch (error) {
      toast.error('אירעה שגיאה במחיקת החג');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPresetHoliday = async (preset: { name: string; month: number; day: number; isRecurring: boolean }) => {
    const currentYear = new Date().getFullYear();
    const date = new Date(currentYear, preset.month - 1, preset.day);
    
    setFormData({
      date: date.toISOString().split('T')[0],
      name: preset.name,
      isRecurring: preset.isRecurring,
    });
    setShowPresets(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ date: '', name: '', isRecurring: false });
  };

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">חגים וימים לא עובדים</h2>
        <p className="text-sm text-gray-600">
          הגדר חגים וימים שבהם העסק לא פעיל. לא ניתן יהיה לקבוע תורים בתאריכים אלו.
        </p>
      </div>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-3">
          {editingId ? 'עריכת חג' : 'הוספת חג חדש'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="form-label">שם החג *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="form-input"
              placeholder="יום כיפור, פסח..."
              required
            />
          </div>

          <div>
            <label className="form-label">תאריך *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isRecurring: e.target.checked }))
              }
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-medium">חג חוזר</span>
              <p className="text-xs text-gray-500">החג חוזר כל שנה באותו תאריך</p>
            </div>
          </label>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {editingId ? (
              <>
                <Save className="w-4 h-4" />
                <span>עדכן</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>הוסף חג</span>
              </>
            )}
          </button>

          {editingId && (
            <button type="button" onClick={cancelEdit} className="btn btn-secondary">
              ביטול
            </button>
          )}

          {!editingId && (
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="btn btn-secondary"
            >
              <Calendar className="w-4 h-4" />
              <span>חגים מוכנים</span>
            </button>
          )}
        </div>

        {/* Presets Dropdown */}
        {showPresets && (
          <div className="mt-4 border border-gray-200 rounded-lg bg-white p-3 max-h-60 overflow-y-auto">
            <h4 className="text-sm font-semibold mb-2">בחר חג מהרשימה:</h4>
            <div className="space-y-1">
              {ISRAELI_HOLIDAYS.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addPresetHoliday(preset)}
                  className="w-full text-right px-3 py-2 hover:bg-gray-100 rounded transition-colors text-sm"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Holidays List */}
      <div>
        <h3 className="font-semibold mb-3">חגים קיימים</h3>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500 mt-2">טוען...</p>
          </div>
        ) : holidays.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">לא הוגדרו חגים עדיין</p>
          </div>
        ) : (
          <div className="space-y-2">
            {holidays.map((holiday) => {
              const isPast = new Date(holiday.date) < new Date();
              const isToday =
                new Date(holiday.date).toDateString() === new Date().toDateString();

              return (
                <div
                  key={holiday.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isToday
                      ? 'border-orange-300 bg-orange-50'
                      : isPast
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{holiday.name}</h4>
                        {holiday.isRecurring && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            חוזר
                          </span>
                        )}
                        {isToday && (
                          <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                            היום
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(new Date(holiday.date), 'EEEE, dd/MM/yyyy', {
                          locale: he,
                        })}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(holiday)}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                        title="ערוך"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(holiday.id)}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                        title="מחק"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

