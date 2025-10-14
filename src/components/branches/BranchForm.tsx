'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Branch } from '@prisma/client';
import { ArrowRight, Save } from 'lucide-react';
import Link from 'next/link';

interface BranchFormProps {
  businessId: string;
  branch?: Branch;
  businessAddress?: string;
}

export function BranchForm({ businessId, branch, businessAddress }: BranchFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: branch?.name || '',
    address: branch?.address || businessAddress || '',
    phone: branch?.phone || '',
    hasCustomHours: branch?.hasCustomHours || false,
    active: branch?.active ?? true,
    isDefault: branch?.isDefault || false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = branch ? `/api/branches/${branch.id}` : '/api/branches';
      const method = branch ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          businessId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save branch');
      }

      toast.success(branch ? 'הסניף עודכן בהצלחה' : 'הסניף נוצר בהצלחה');
      router.push('/dashboard/branches');
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
        {/* Branch Name */}
        <div>
          <label htmlFor="name" className="form-label">
            שם הסניף *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="למשל: סניף תל אביב"
            required
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="form-label">
            כתובת
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            className="form-input"
            placeholder="רחוב, מספר, עיר"
          />
        </div>

        {/* Phone */}
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
            placeholder="03-1234567"
          />
        </div>

        {/* Custom Hours */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="hasCustomHours"
              checked={formData.hasCustomHours}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-medium">שעות פעילות מותאמות אישית</span>
              <p className="text-xs text-gray-500">
                סניף זה יפעל בשעות שונות מהעסק הראשי
              </p>
            </div>
          </label>
        </div>

        {/* Active */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium">סניף פעיל</span>
          </label>
        </div>

        {/* Default Branch */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-medium">סניף ברירת מחדל</span>
              <p className="text-xs text-gray-500">
                סניף זה יוצג כברירת מחדל בעת הזמנת תורים
              </p>
            </div>
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
                <span>{branch ? 'עדכן סניף' : 'צור סניף'}</span>
              </>
            )}
          </button>
          <Link
            href="/dashboard/branches"
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

