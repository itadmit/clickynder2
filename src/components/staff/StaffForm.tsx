'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Staff, Branch, Service } from '@prisma/client';
import { ArrowRight, Save } from 'lucide-react';
import Link from 'next/link';

interface StaffFormProps {
  businessId: string;
  branches: Branch[];
  services: Service[];
  staff?: Staff & { serviceStaff?: { serviceId: string }[] };
}

export function StaffForm({ businessId, branches, services, staff }: StaffFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: staff?.name || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    branchId: staff?.branchId || '',
    roleLabel: staff?.roleLabel || '',
    calendarColor: staff?.calendarColor || '#0ea5e9',
    calendarProvider: staff?.calendarProvider || 'none',
    active: staff?.active ?? true,
    serviceIds: staff?.serviceStaff?.map((s) => s.serviceId) || [],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = staff ? `/api/staff/${staff.id}` : '/api/staff';
      const method = staff ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          businessId,
          branchId: formData.branchId || null,
          email: formData.email || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save staff');
      }

      toast.success(staff ? 'העובד עודכן בהצלחה' : 'העובד נוצר בהצלחה');
      router.push('/dashboard/staff');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'אירעה שגיאה');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="form-label">
            שם מלא *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="שם העובד"
            required
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="form-label">
              טלפון
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="050-1234567"
            />
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              אימייל
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="email@example.com"
            />
          </div>
        </div>

        {/* Role and Branch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="roleLabel" className="form-label">
              תפקיד
            </label>
            <input
              id="roleLabel"
              name="roleLabel"
              type="text"
              value={formData.roleLabel}
              onChange={handleChange}
              className="form-input"
              placeholder="למשל: ספר, עיסויסט, מאמן"
            />
          </div>

          <div>
            <label htmlFor="branchId" className="form-label">
              סניף
            </label>
            <select
              id="branchId"
              name="branchId"
              value={formData.branchId}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">ללא סניף ספציפי</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar Color */}
        <div>
          <label htmlFor="calendarColor" className="form-label">
            צבע ביומן
          </label>
          <div className="flex gap-2 items-center">
            <input
              id="calendarColor"
              name="calendarColor"
              type="color"
              value={formData.calendarColor}
              onChange={handleChange}
              className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={formData.calendarColor}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, calendarColor: e.target.value }))
              }
              className="form-input flex-1"
              placeholder="#0ea5e9"
            />
          </div>
        </div>

        {/* Calendar Provider */}
        <div>
          <label htmlFor="calendarProvider" className="form-label">
            חיבור יומן
          </label>
          <select
            id="calendarProvider"
            name="calendarProvider"
            value={formData.calendarProvider}
            onChange={handleChange}
            className="form-input"
          >
            <option value="none">ללא חיבור</option>
            <option value="google">Google Calendar</option>
            <option value="outlook">Microsoft Outlook</option>
            <option value="apple">Apple Calendar</option>
          </select>
        </div>

        {/* Services */}
        <div>
          <label className="form-label">שירותים שהעובד מבצע</label>
          {services.length === 0 ? (
            <p className="text-sm text-gray-500">
              אין שירותים זמינים.{' '}
              <Link href="/dashboard/services/new" className="text-primary-600 hover:underline">
                הוסף שירות
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {services.map((service) => (
                <label
                  key={service.id}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.serviceIds.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm">{service.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Active */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, active: e.target.checked }))
              }
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium">עובד פעיל</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>שומר...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{staff ? 'עדכן עובד' : 'צור עובד'}</span>
              </>
            )}
          </button>
          <Link
            href="/dashboard/staff"
            className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            <span>ביטול</span>
          </Link>
        </div>
      </div>
    </form>
  );
}

