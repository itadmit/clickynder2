'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Edit2, Save, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDate } from 'date-fns';
import { he } from 'date-fns/locale';

interface TimeOff {
  id: string;
  scope: 'staff' | 'branch';
  staffId?: string;
  branchId?: string;
  startAt: string;
  endAt: string;
  reason?: string;
  staff?: { id: string; name: string };
  branch?: { id: string; name: string };
}

interface TimeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  staffId: string;
  staffName: string;
  onSuccess: () => void;
}

export function TimeOffModal({
  isOpen,
  onClose,
  businessId,
  staffId,
  staffName,
  onSuccess,
}: TimeOffModalProps) {
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    startAt: '',
    endAt: '',
    reason: '',
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchTimeOffs();
    }
  }, [isOpen, staffId]);

  const fetchTimeOffs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/time-off?businessId=${businessId}&staffId=${staffId}`
      );
      if (response.ok) {
        const data = await response.json();
        setTimeOffs(data);
      }
    } catch (error) {
      console.error('Failed to fetch time-offs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startAt || !formData.endAt) {
      toast.error('נא למלא תאריכי התחלה וסיום');
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
          scope: 'staff',
          staffId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save time-off');
      }

      toast.success(editingId ? 'החופשה עודכנה בהצלחה' : 'החופשה נוספה בהצלחה');
      setFormData({ startAt: '', endAt: '', reason: '' });
      setEditingId(null);
      fetchTimeOffs();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'אירעה שגיאה');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (timeOff: TimeOff) => {
    setEditingId(timeOff.id);
    setFormData({
      startAt: timeOff.startAt.split('T')[0],
      endAt: timeOff.endAt.split('T')[0],
      reason: timeOff.reason || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק חופשה זו?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/time-off/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete time-off');
      }

      toast.success('החופשה נמחקה בהצלחה');
      fetchTimeOffs();
      onSuccess();
    } catch (error) {
      toast.error('אירעה שגיאה במחיקת החופשה');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ startAt: '', endAt: '', reason: '' });
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold">ניהול חופשים</h2>
            <p className="text-sm text-gray-600 mt-1">{staffName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add/Edit Form */}
          <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">
              {editingId ? 'עריכת חופשה' : 'הוספת חופשה חדשה'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="form-label">תאריך התחלה *</label>
                <input
                  type="date"
                  value={formData.startAt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, startAt: e.target.value }))
                  }
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">תאריך סיום *</label>
                <input
                  type="date"
                  value={formData.endAt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endAt: e.target.value }))
                  }
                  className="form-input"
                  required
                  min={formData.startAt}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">סיבה (אופציונלי)</label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reason: e.target.value }))
                }
                className="form-input"
                placeholder="חופשה, חג, מחלה..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {editingId ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>עדכן</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>הוסף חופשה</span>
                  </>
                )}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn btn-secondary"
                >
                  ביטול
                </button>
              )}
            </div>
          </form>

          {/* Time Offs List */}
          <div>
            <h3 className="font-semibold mb-3">חופשים קיימים</h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">טוען...</p>
              </div>
            ) : timeOffs.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">אין חופשים מתוכננים</p>
              </div>
            ) : (
              <div className="space-y-2">
                {timeOffs.map((timeOff) => {
                  const isPast = new Date(timeOff.endAt) < new Date();
                  const isCurrent =
                    new Date(timeOff.startAt) <= new Date() &&
                    new Date(timeOff.endAt) >= new Date();

                  return (
                    <div
                      key={timeOff.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isCurrent
                          ? 'border-orange-300 bg-orange-50'
                          : isPast
                          ? 'border-gray-200 bg-gray-50 opacity-60'
                          : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="font-medium">
                              {formatDate(new Date(timeOff.startAt), 'dd/MM/yyyy', {
                                locale: he,
                              })}{' '}
                              -{' '}
                              {formatDate(new Date(timeOff.endAt), 'dd/MM/yyyy', {
                                locale: he,
                              })}
                            </span>
                            {isCurrent && (
                              <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                                פעיל כעת
                              </span>
                            )}
                            {isPast && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                הסתיים
                              </span>
                            )}
                          </div>
                          
                          {timeOff.reason && (
                            <p className="text-sm text-gray-600">{timeOff.reason}</p>
                          )}
                        </div>

                        {!isPast && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(timeOff)}
                              disabled={isSubmitting}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                              title="ערוך"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(timeOff.id)}
                              disabled={isSubmitting}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                              title="מחק"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn bg-gray-600 text-white hover:bg-gray-700 w-full"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

