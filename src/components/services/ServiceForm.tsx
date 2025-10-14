'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Service, ServiceCategory, Staff } from '@prisma/client';
import { ArrowRight, Save } from 'lucide-react';
import Link from 'next/link';

interface ServiceFormProps {
  businessId: string;
  categories: ServiceCategory[];
  staff: Staff[];
  service?: Service & { serviceStaff?: { staffId: string }[] };
}

export function ServiceForm({ businessId, categories, staff, service }: ServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: service?.name || '',
    categoryId: service?.categoryId || '',
    durationMin: service?.durationMin || 30,
    priceCents: service?.priceCents ? service.priceCents / 100 : 0,
    bufferAfterMin: service?.bufferAfterMin || 0,
    description: service?.description || '',
    color: service?.color || '#0ea5e9',
    active: service?.active ?? true,
    staffIds: service?.serviceStaff?.map((s) => s.staffId) || [],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleStaffToggle = (staffId: string) => {
    setFormData((prev) => ({
      ...prev,
      staffIds: prev.staffIds.includes(staffId)
        ? prev.staffIds.filter((id) => id !== staffId)
        : [...prev.staffIds, staffId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = service
        ? `/api/services/${service.id}`
        : '/api/services';
      
      const method = service ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          businessId,
          priceCents: Math.round(formData.priceCents * 100),
          categoryId: formData.categoryId || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save service');
      }

      toast.success(service ? 'השירות עודכן בהצלחה' : 'השירות נוצר בהצלחה');
      router.push('/dashboard/services');
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
        {/* Service Name */}
        <div>
          <label htmlFor="name" className="form-label">
            שם השירות *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="למשל: תספורת גבר"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="form-label">
            קטגוריה
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">ללא קטגוריה</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Duration and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="durationMin" className="form-label">
              משך השירות (דקות) *
            </label>
            <input
              id="durationMin"
              name="durationMin"
              type="number"
              min="5"
              step="5"
              value={formData.durationMin}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="priceCents" className="form-label">
              מחיר (₪)
            </label>
            <input
              id="priceCents"
              name="priceCents"
              type="number"
              min="0"
              step="0.01"
              value={formData.priceCents}
              onChange={handleChange}
              className="form-input"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Buffer After */}
        <div>
          <label htmlFor="bufferAfterMin" className="form-label">
            מרווח זמן נוסף לאחר השירות (דקות)
          </label>
          <input
            id="bufferAfterMin"
            name="bufferAfterMin"
            type="number"
            min="0"
            step="5"
            value={formData.bufferAfterMin}
            onChange={handleChange}
            className="form-input"
          />
          <p className="text-xs text-gray-500 mt-1">
            זמן להתארגנות, ניקיון או הפסקה בין לקוחות
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="form-label">
            תיאור השירות
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            rows={3}
            placeholder="תאר את השירות..."
          />
        </div>

        {/* Color */}
        <div>
          <label htmlFor="color" className="form-label">
            צבע לזיהוי בלוח הזמנים
          </label>
          <div className="flex gap-2 items-center">
            <input
              id="color"
              name="color"
              type="color"
              value={formData.color}
              onChange={handleChange}
              className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
              className="form-input flex-1"
              placeholder="#0ea5e9"
            />
          </div>
        </div>

        {/* Assigned Staff */}
        <div>
          <label className="form-label">עובדים משויכים</label>
          {staff.length === 0 ? (
            <p className="text-sm text-gray-500">
              אין עובדים זמינים.{' '}
              <Link href="/dashboard/staff/new" className="text-primary-600 hover:underline">
                הוסף עובד
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {staff.map((staffMember) => (
                <label
                  key={staffMember.id}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.staffIds.includes(staffMember.id)}
                    onChange={() => handleStaffToggle(staffMember.id)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm">{staffMember.name}</span>
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
            <span className="text-sm font-medium">שירות פעיל</span>
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
                <span>{service ? 'עדכן שירות' : 'צור שירות'}</span>
              </>
            )}
          </button>
          <Link
            href="/dashboard/services"
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

