'use client';

import { useState } from 'react';
import { ArrowRight, User, Phone, Mail, MessageSquare } from 'lucide-react';

interface CustomerFormProps {
  initialData?: {
    name?: string;
    phone?: string;
    email?: string;
    notes?: string;
  };
  onSubmit: (data: {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
  }) => void;
  onBack: () => void;
}

export function CustomerForm({ initialData, onSubmit, onBack }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-2">פרטים אישיים</h2>
      <p className="text-gray-600 mb-6">איך נוכל ליצור איתך קשר?</p>

      <div className="space-y-4 mb-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="form-label">
            שם מלא *
          </label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="form-input pr-10"
              placeholder="שם פרטי ומשפחה"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="form-label">
            טלפון *
          </label>
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="form-input pr-10"
              placeholder="050-1234567"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="form-label">
            אימייל (אופציונלי)
          </label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="form-input pr-10"
              placeholder="email@example.com"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="form-label">
            הערות (אופציונלי)
          </label>
          <div className="relative">
            <MessageSquare className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="form-input pr-10"
              rows={3}
              placeholder="יש משהו שחשוב לנו לדעת?"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button type="submit" className="btn btn-primary flex-1">
          המשך לסיכום
        </button>
        
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          <span>חזרה</span>
        </button>
      </div>
    </form>
  );
}

