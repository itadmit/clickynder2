'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Briefcase, User, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  durationMin: number;
  priceCents: number;
}

interface Staff {
  id: string;
  name: string;
}

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  currentData: {
    startAt: string;
    endAt: string;
    serviceId: string;
    staffId: string;
    businessId: string;
  };
  onSuccess: () => void;
}

export function EditAppointmentModal({
  isOpen,
  onClose,
  appointmentId,
  currentData,
  onSuccess,
}: EditAppointmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    date: new Date(currentData.startAt).toISOString().split('T')[0],
    time: new Date(currentData.startAt).toTimeString().substring(0, 5),
    serviceId: currentData.serviceId,
    staffId: currentData.staffId,
  });

  useEffect(() => {
    if (isOpen) {
      fetchServicesAndStaff();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.date && formData.serviceId && formData.staffId) {
      fetchAvailableSlots();
    }
  }, [formData.date, formData.serviceId, formData.staffId]);

  const fetchServicesAndStaff = async () => {
    try {
      const [servicesRes, staffRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/staff'),
      ]);

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      }

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const params = new URLSearchParams({
        businessId: currentData.businessId,
        date: formData.date,
        serviceId: formData.serviceId,
        staffId: formData.staffId,
      });

      const response = await fetch(`/api/appointments/slots?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/appointments/${appointmentId}/edit-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          time: formData.time,
          serviceId: formData.serviceId,
          staffId: formData.staffId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit edit request');
      }

      toast.success('בקשת עריכה נשלחה ללקוח לאישור!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('שגיאה בשליחת בקשת העריכה');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">עריכת תור</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mx-6 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">הלקוח יקבל התראה עם בקשה לאישור השינויים</p>
            <p className="text-blue-700">
              השינויים ייכנסו לתוקף רק לאחר שהלקוח יאשר את התור החדש דרך הלינק שיישלח אליו
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date */}
          <div>
            <label className="form-label flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              תאריך חדש
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className="form-input"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Service */}
          <div>
            <label className="form-label flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-400" />
              שירות
            </label>
            <select
              value={formData.serviceId}
              onChange={(e) => setFormData((prev) => ({ ...prev, serviceId: e.target.value }))}
              className="form-input"
              required
            >
              <option value="">בחר שירות</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.durationMin} דקות)
                </option>
              ))}
            </select>
          </div>

          {/* Staff */}
          <div>
            <label className="form-label flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              מטפל/ת
            </label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData((prev) => ({ ...prev, staffId: e.target.value }))}
              className="form-input"
              required
            >
              <option value="">בחר מטפל</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Slots */}
          <div>
            <label className="form-label flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              שעה זמינה
            </label>
            {formData.date && formData.serviceId && formData.staffId ? (
              availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, time: slot }))}
                      className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                        formData.time === slot
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">אין שעות פנויות בתאריך זה</p>
                  <p className="text-xs text-gray-500 mt-1">נסה לבחור תאריך אחר</p>
                </div>
              )
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">בחר תאריך, שירות ומטפל/ת כדי לראות שעות זמינות</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={isLoading || !formData.time}
              className="btn btn-primary flex-1"
            >
              {isLoading ? 'שולח...' : 'שלח לאישור לקוח'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

