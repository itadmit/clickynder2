'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  User,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  durationMin: number;
  priceCents: number;
}

interface Staff {
  id: string;
  name: string;
  branchId: string | null;
}

interface Branch {
  id: string;
  name: string;
  address: string | null;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const [formData, setFormData] = useState({
    serviceId: '',
    staffId: '',
    branchId: '',
    date: '',
    time: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
  });

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch time slots when date, service, and staff are selected
  useEffect(() => {
    if (formData.date && formData.serviceId && formData.staffId) {
      fetchTimeSlots();
    }
  }, [formData.date, formData.serviceId, formData.staffId]);

  const fetchData = async () => {
    try {
      const [servicesRes, staffRes, branchesRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/staff'),
        fetch('/api/branches'),
      ]);

      if (!servicesRes.ok || !staffRes.ok || !branchesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const servicesData = await servicesRes.json();
      const staffData = await staffRes.json();
      const branchesData = await branchesRes.json();

      setServices(Array.isArray(servicesData) ? servicesData : []);
      setStaff(Array.isArray(staffData) ? staffData : []);
      setBranches(Array.isArray(branchesData) ? branchesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('שגיאה בטעינת הנתונים');
      setServices([]);
      setStaff([]);
      setBranches([]);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const params = new URLSearchParams({
        date: formData.date,
        serviceId: formData.serviceId,
        staffId: formData.staffId,
      });

      const response = await fetch(`/api/appointments/slots?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTimeSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create or find customer
      const customerResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.customerName,
          phone: formData.customerPhone,
          email: formData.customerEmail,
        }),
      });

      if (!customerResponse.ok) {
        throw new Error('שגיאה ביצירת לקוח');
      }

      const customer = await customerResponse.json();

      // Create appointment
      const appointmentResponse = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          staffId: formData.staffId,
          branchId: formData.branchId,
          customerId: customer.id,
          date: formData.date,
          time: formData.time,
          notesCustomer: formData.notes,
          source: 'DASHBOARD',
        }),
      });

      if (!appointmentResponse.ok) {
        const error = await appointmentResponse.json();
        throw new Error(error.error || 'שגיאה ביצירת התור');
      }

      toast.success('התור נוצר בהצלחה!');
      router.push('/dashboard/appointments');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'אירעה שגיאה');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter staff by selected branch
  const filteredStaff = formData.branchId
    ? staff.filter((s) => s.branchId === formData.branchId || !s.branchId)
    : staff;

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Check if we have the required data
  const hasRequiredData = services.length > 0 && staff.length > 0 && branches.length > 0;

  return (
    <div>
      <DashboardHeader
        title="יצירת תור חדש"
        subtitle="צור תור ידני עבור לקוח"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          {/* Missing Data Alert */}
          {!hasRequiredData && (
            <div className="card bg-yellow-50 border-yellow-200 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-yellow-900 mb-2">
                    נדרש להשלים הגדרות בסיסיות
                  </h3>
                  <p className="text-yellow-800 mb-4">
                    לפני שתוכל ליצור תור, עליך להגדיר את הפרטים הבאים:
                  </p>
                  <div className="space-y-2">
                    {services.length === 0 && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <span className="text-gray-700">לא הוגדרו שירותים</span>
                        <button
                          type="button"
                          onClick={() => router.push('/dashboard/services/new')}
                          className="btn btn-sm btn-primary"
                        >
                          הוסף שירות ראשון
                        </button>
                      </div>
                    )}
                    {branches.length === 0 && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <span className="text-gray-700">לא הוגדרו סניפים</span>
                        <button
                          type="button"
                          onClick={() => router.push('/dashboard/branches/new')}
                          className="btn btn-sm btn-primary"
                        >
                          הוסף סניף ראשון
                        </button>
                      </div>
                    )}
                    {staff.length === 0 && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <span className="text-gray-700">לא הוגדרו ספקי שירות</span>
                        <button
                          type="button"
                          onClick={() => router.push('/dashboard/staff/new')}
                          className="btn btn-sm btn-primary"
                        >
                          הוסף ספק שירות ראשון
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card space-y-6">
            {/* Service Selection */}
            <div>
              <label htmlFor="serviceId" className="form-label flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                שירות
              </label>
              <select
                id="serviceId"
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                className="form-input"
                required
                disabled={isLoading}
              >
                <option value="">בחר שירות</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.durationMin} דקות - ₪
                    {(service.priceCents / 100).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Selection */}
            <div>
              <label htmlFor="branchId" className="form-label flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                סניף
              </label>
              <select
                id="branchId"
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                className="form-input"
                required
                disabled={isLoading}
              >
                <option value="">בחר סניף</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                    {branch.address && ` - ${branch.address}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Staff Selection */}
            <div>
              <label htmlFor="staffId" className="form-label flex items-center gap-2">
                <User className="w-4 h-4" />
                ספק שירות
              </label>
              <select
                id="staffId"
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                className="form-input"
                required
                disabled={isLoading || !formData.branchId}
              >
                <option value="">בחר ספק שירות</option>
                {filteredStaff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              {!formData.branchId && (
                <p className="text-sm text-gray-500 mt-1">
                  בחר סניף תחילה
                </p>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="form-label flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                תאריך
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={today}
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>

            {/* Time Selection */}
            <div>
              <label htmlFor="time" className="form-label flex items-center gap-2">
                <Clock className="w-4 h-4" />
                שעה
              </label>
              {timeSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, time: slot.time }))
                      }
                      disabled={!slot.available || isLoading}
                      className={`
                        px-4 py-2 rounded-lg border-2 transition-all
                        ${
                          formData.time === slot.time
                            ? 'border-primary-600 bg-primary-50 text-primary-600'
                            : slot.available
                            ? 'border-gray-200 hover:border-primary-300'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isLoading}
                />
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">פרטי הלקוח</h3>

              {/* Customer Name */}
              <div className="mb-4">
                <label htmlFor="customerName" className="form-label flex items-center gap-2">
                  <User className="w-4 h-4" />
                  שם מלא
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isLoading}
                  placeholder="שם הלקוח"
                />
              </div>

              {/* Customer Phone */}
              <div className="mb-4">
                <label htmlFor="customerPhone" className="form-label flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  טלפון
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isLoading}
                  placeholder="050-1234567"
                />
              </div>

              {/* Customer Email */}
              <div className="mb-4">
                <label htmlFor="customerEmail" className="form-label flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  אימייל (אופציונלי)
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="form-input"
                  disabled={isLoading}
                  placeholder="email@example.com"
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="form-label flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  הערות (אופציונלי)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="form-input"
                  disabled={isLoading}
                  placeholder="הערות נוספות"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary flex-1"
                disabled={isLoading}
              >
                ביטול
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={isLoading || !hasRequiredData}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>יוצר תור...</span>
                  </>
                ) : (
                  <>
                    <span>צור תור</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

