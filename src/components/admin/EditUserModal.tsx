'use client';

import { useState, useEffect } from 'react';
import { User, Business, Subscription, Package } from '@prisma/client';
import { X, User as UserIcon, Mail, Phone, Link as LinkIcon, Lock, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

type UserWithBusinesses = User & {
  ownedBusinesses: (Business & {
    subscription: (Subscription & { package: Package }) | null;
  })[];
};

interface EditUserModalProps {
  user: UserWithBusinesses;
  onClose: () => void;
  onSuccess: (updatedUser: UserWithBusinesses) => void;
}

export function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    businessSlug: user.ownedBusinesses[0]?.slug || '',
    packageCode: user.ownedBusinesses[0]?.subscription?.package.code || 'starter',
    resetPassword: false,
    newPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // עדכון פרטי משתמש
      const userResponse = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          ...(formData.resetPassword && formData.newPassword && { password: formData.newPassword }),
        }),
      });

      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(error.error || 'Failed to update user');
      }

      // עדכון slug של העסק
      if (user.ownedBusinesses[0] && formData.businessSlug !== user.ownedBusinesses[0].slug) {
        const businessResponse = await fetch(`/api/businesses/${user.ownedBusinesses[0].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: formData.businessSlug }),
        });

        if (!businessResponse.ok) {
          const error = await businessResponse.json();
          throw new Error(error.error || 'Failed to update business slug');
        }
      }

      // עדכון חבילה
      if (
        user.ownedBusinesses[0] &&
        formData.packageCode !== user.ownedBusinesses[0]?.subscription?.package.code
      ) {
        const subscriptionResponse = await fetch(
          `/api/admin/subscriptions/${user.ownedBusinesses[0].id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ packageCode: formData.packageCode }),
          }
        );

        if (!subscriptionResponse.ok) {
          const error = await subscriptionResponse.json();
          throw new Error(error.error || 'Failed to update subscription');
        }
      }

      toast.success('המשתמש עודכן בהצלחה');
      
      // רענון הנתונים
      const refreshedUser = await fetch(`/api/admin/users/${user.id}`).then(res => res.json());
      onSuccess(refreshedUser);
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'שגיאה בעדכון המשתמש');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">עריכת משתמש</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* שם */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="w-4 h-4 inline ml-1" />
              שם מלא *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              required
            />
          </div>

          {/* אימייל */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline ml-1" />
              אימייל *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
              required
            />
          </div>

          {/* טלפון */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline ml-1" />
              טלפון
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="form-input"
              placeholder="0501234567"
            />
          </div>

          {/* Slug העסק */}
          {user.ownedBusinesses[0] && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <LinkIcon className="w-4 h-4 inline ml-1" />
                כתובת העסק (Slug)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.businessSlug}
                  onChange={(e) =>
                    setFormData({ ...formData, businessSlug: e.target.value.toLowerCase() })
                  }
                  className="form-input flex-1"
                  dir="ltr"
                  pattern="[a-z0-9-]+"
                />
                <span className="text-gray-500 text-sm">/clickynder.com</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">רק אותיות אנגליות קטנות, מספרים ומקפים</p>
            </div>
          )}

          {/* חבילה */}
          {user.ownedBusinesses[0] && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline ml-1" />
                חבילת מנוי
              </label>
              <select
                value={formData.packageCode}
                onChange={(e) => setFormData({ ...formData, packageCode: e.target.value })}
                className="form-input"
              >
                <option value="trial">ניסיון (Trial)</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          )}

          {/* איפוס סיסמה */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="resetPassword"
                checked={formData.resetPassword}
                onChange={(e) =>
                  setFormData({ ...formData, resetPassword: e.target.checked, newPassword: '' })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="resetPassword" className="text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4 inline ml-1" />
                איפוס סיסמה
              </label>
            </div>

            {formData.resetPassword && (
              <div>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="form-input"
                  placeholder="סיסמה חדשה (מינימום 6 תווים)"
                  minLength={6}
                  required={formData.resetPassword}
                />
              </div>
            )}
          </div>

          {/* כפתורים */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              ביטול
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'שומר...' : 'שמור שינויים'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

