'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ServiceCategory } from '@prisma/client';
import { X, Plus, Trash2, Edit2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  categories: ServiceCategory[];
  onCategoryCreated: () => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  businessId,
  categories: initialCategories,
  onCategoryCreated,
}: CategoryModalProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/service-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          businessId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      const newCategory = await response.json();
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      toast.success('הקטגוריה נוצרה בהצלחה');
      onCategoryCreated();
    } catch (error) {
      toast.error('אירעה שגיאה ביצירת הקטגוריה');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/service-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      const updatedCategory = await response.json();
      setCategories(
        categories.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
      setEditingId(null);
      setEditingName('');
      toast.success('הקטגוריה עודכנה בהצלחה');
      onCategoryCreated();
    } catch (error) {
      toast.error('אירעה שגיאה בעדכון הקטגוריה');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/service-categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setCategories(categories.filter((cat) => cat.id !== id));
      toast.success('הקטגוריה נמחקה בהצלחה');
      onCategoryCreated();
    } catch (error) {
      toast.error('אירעה שגיאה במחיקת הקטגוריה');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (category: ServiceCategory) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">ניהול קטגוריות</h2>
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
          {/* Create New Category */}
          <form onSubmit={handleCreateCategory} className="mb-6">
            <label className="form-label">קטגוריה חדשה</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="form-input flex-1"
                placeholder="שם הקטגוריה"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newCategoryName.trim()}
                className="btn btn-primary"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Categories List */}
          <div className="space-y-2">
            <label className="form-label">קטגוריות קיימות</label>
            {categories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                אין קטגוריות עדיין
              </p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    {editingId === category.id ? (
                      <>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="form-input flex-1 !py-1"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateCategory(category.id)}
                          disabled={isSubmitting || !editingName.trim()}
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                          title="שמור"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={isSubmitting}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          title="ביטול"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium">
                          {category.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEditing(category)}
                          disabled={isSubmitting}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                          title="ערוך"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={isSubmitting}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                          title="מחק"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
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

