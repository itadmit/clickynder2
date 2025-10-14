'use client';

import { useState } from 'react';
import { Business } from '@prisma/client';
import { Save, Upload, Palette, Layout, Sparkles, Square, Circle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface BookingPageDesignProps {
  business: Business;
}

const templates = [
  {
    id: 'modern',
    name: 'מודרני',
    description: 'עיצוב נקי ומודרני עם גרדיאנטים',
    icon: Sparkles,
    gradient: 'from-blue-500 to-purple-600',
  },
  {
    id: 'classic',
    name: 'קלאסי',
    description: 'עיצוב מסורתי ואלגנטי',
    icon: Square,
    gradient: 'from-gray-600 to-gray-800',
  },
  {
    id: 'minimal',
    name: 'מינימליסטי',
    description: 'עיצוב פשוט ונקי',
    icon: Circle,
    gradient: 'from-slate-400 to-slate-600',
  },
];

export function BookingPageDesign({ business }: BookingPageDesignProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    logoUrl: business.logoUrl || '',
    templateStyle: business.templateStyle || 'modern',
    primaryColor: business.primaryColor || '#0ea5e9',
    secondaryColor: business.secondaryColor || '#d946ef',
    description: business.description || '',
    showBranches: business.showBranches,
    showStaff: business.showStaff,
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('נא להעלות קובץ תמונה בלבד');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('גודל הקובץ חייב להיות פחות מ-5MB');
      return;
    }

    setIsUploadingLogo(true);

    try {
      // For now, we'll use a placeholder. In production, upload to cloud storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
        toast.success('הלוגו הועלה בהצלחה! זכור לשמור את השינויים');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('שגיאה בהעלאת הלוגו');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/businesses/${business.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update design');
      }

      toast.success('העיצוב נשמר בהצלחה');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'אירעה שגיאה בשמירת העיצוב');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Logo Upload Section */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary-600" />
          לוגו העסק
        </h3>
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Logo Preview */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <span className="text-gray-400 text-sm text-center">
                  אין לוגו
                </span>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex-1">
            <label
              htmlFor="logo-upload"
              className="btn btn-secondary inline-flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              {isUploadingLogo ? 'מעלה...' : 'העלה לוגו'}
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              disabled={isUploadingLogo}
            />
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG, WebP עד 5MB. מומלץ: 512x512 פיקסלים
            </p>
            {formData.logoUrl && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, logoUrl: '' }))}
                className="text-sm text-red-600 hover:text-red-700 mt-2"
              >
                הסר לוגו
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div className="card">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Layout className="w-5 h-5 text-primary-600" />
          בחר תבנית עיצוב
        </h3>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Templates List */}
          <div className="flex-1 space-y-3">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, templateStyle: template.id }))}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-right flex items-center gap-4 ${
                    formData.templateStyle === template.id
                      ? 'border-primary-600 bg-primary-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.gradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                  {formData.templateStyle === template.id && (
                    <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* iPhone Preview */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <div className="text-sm font-semibold text-gray-700 mb-3 text-center">תצוגה מקדימה</div>
              {/* iPhone Frame */}
              <div className="relative mx-auto w-64 h-[550px]">
                {/* iPhone Border */}
                <div className="absolute inset-0 bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  {/* Screen */}
                  <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="h-6 bg-gray-100 flex items-center justify-between px-6 text-[10px]">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 bg-gray-400 rounded-sm"></div>
                        <div className="w-4 h-2 bg-gray-400 rounded-sm"></div>
                        <div className="w-4 h-2 bg-gray-400 rounded-sm"></div>
                      </div>
                    </div>
                    
                    {/* Preview Content - Changes based on selected template */}
                    <div className="h-full overflow-hidden">
                      {formData.templateStyle === 'modern' && (
                        <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-3 overflow-y-auto">
                          {/* Modern Preview */}
                          <div className="bg-white rounded-xl p-3 mb-2 shadow-sm">
                            {formData.logoUrl && (
                              <div className="w-10 h-10 mx-auto mb-2 bg-blue-500 rounded-lg p-0.5">
                                <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain bg-white rounded" />
                              </div>
                            )}
                            <div className="text-[9px] font-bold text-center">{business.name}</div>
                            {formData.description && (
                              <div className="text-[7px] text-gray-600 text-center mt-1">{formData.description.slice(0, 30)}...</div>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <div className="bg-white rounded-lg p-2">
                              <div className="text-[8px] font-bold">שירות 1</div>
                              <div className="flex justify-between items-center mt-1">
                                <div className="text-[7px] text-gray-600">30 דק</div>
                                <div className="text-[8px] font-bold">₪100</div>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-2">
                              <div className="text-[8px] font-bold">שירות 2</div>
                              <div className="flex justify-between items-center mt-1">
                                <div className="text-[7px] text-gray-600">45 דק</div>
                                <div className="text-[8px] font-bold">₪150</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.templateStyle === 'classic' && (
                        <div className="h-full bg-gray-50 overflow-y-auto">
                          {/* Classic Preview */}
                          <div className="bg-white border-b p-3">
                            <div className="flex items-center gap-2">
                              {formData.logoUrl ? (
                                <img src={formData.logoUrl} alt="Logo" className="w-8 h-8 rounded object-contain bg-gray-50 p-1" />
                              ) : (
                                <div className="w-8 h-8 rounded bg-gray-800 text-white flex items-center justify-center text-[10px] font-bold">
                                  {business.name.charAt(0)}
                                </div>
                              )}
                              <div className="text-[9px] font-bold">{business.name}</div>
                            </div>
                          </div>
                          <div className="p-3 space-y-2">
                            <div className="border border-gray-200 rounded p-2">
                              <div className="text-[8px] font-bold mb-1">שירות 1</div>
                              <div className="flex justify-between">
                                <div className="text-[7px] text-gray-600">30 דק</div>
                                <div className="text-[8px] font-bold">₪100</div>
                              </div>
                            </div>
                            <div className="border border-gray-200 rounded p-2">
                              <div className="text-[8px] font-bold mb-1">שירות 2</div>
                              <div className="flex justify-between">
                                <div className="text-[7px] text-gray-600">45 דק</div>
                                <div className="text-[8px] font-bold">₪150</div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-t p-3 mt-auto">
                            <div className="bg-gray-900 text-white text-[8px] font-bold py-2 rounded text-center">
                              קביעת תור
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.templateStyle === 'minimal' && (
                        <div className="h-full overflow-y-auto">
                          {/* Minimal Bold Preview */}
                          <div 
                            className="p-4 text-white text-center"
                            style={{
                              background: `linear-gradient(135deg, ${formData.primaryColor} 0%, ${formData.secondaryColor} 100%)`
                            }}
                          >
                            {formData.logoUrl && (
                              <img src={formData.logoUrl} alt="Logo" className="w-12 h-12 mx-auto mb-1" />
                            )}
                            <div className="text-[10px] font-black">{business.name}</div>
                            {formData.description && (
                              <div className="text-[7px] opacity-90 mt-0.5">{formData.description.slice(0, 25)}...</div>
                            )}
                            <div className="bg-white text-gray-900 text-[7px] font-bold py-1.5 rounded-full mt-2">
                              קבע תור
                            </div>
                          </div>
                          <div className="p-3 bg-gray-100 space-y-1.5">
                            <div className="bg-white rounded-xl overflow-hidden">
                              <div className="h-0.5" style={{ backgroundColor: formData.primaryColor }}></div>
                              <div className="p-2">
                                <div className="text-[8px] font-bold">שירות 1</div>
                                <div className="flex justify-between items-center mt-1">
                                  <div className="text-[7px]">30'</div>
                                  <div className="text-[9px] font-black" style={{ color: formData.primaryColor }}>₪100</div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl overflow-hidden">
                              <div className="h-0.5" style={{ backgroundColor: formData.primaryColor }}></div>
                              <div className="p-2">
                                <div className="text-[8px] font-bold">שירות 2</div>
                                <div className="flex justify-between items-center mt-1">
                                  <div className="text-[7px]">45'</div>
                                  <div className="text-[9px] font-black" style={{ color: formData.primaryColor }}>₪150</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-900 rounded-full"></div>
                  </div>
                </div>
                
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Scheme */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary-600" />
          ערכת צבעים
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Color */}
          <div>
            <label htmlFor="primaryColor" className="form-label">
              צבע ראשי
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                className="w-20 h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                className="form-input flex-1"
                placeholder="#0ea5e9"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label htmlFor="secondaryColor" className="form-label">
              צבע משני
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                className="w-20 h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                className="form-input flex-1"
                placeholder="#d946ef"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">תיאור העסק</h3>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          className="form-input"
          rows={4}
          placeholder="ספר קצת על העסק שלך... התיאור יוצג בעמוד קביעת התורים"
        />
      </div>

      {/* Display Options */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">אפשרויות תצוגה</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={formData.showBranches}
              onChange={(e) => setFormData((prev) => ({ ...prev, showBranches: e.target.checked }))}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">הצגת סניפים בעמוד ההזמנה</span>
              <p className="text-xs text-gray-500">אפשר ללקוחות לבחור סניף</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={formData.showStaff}
              onChange={(e) => setFormData((prev) => ({ ...prev, showStaff: e.target.checked }))}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">הצגת עובדים בעמוד ההזמנה</span>
              <p className="text-xs text-gray-500">אפשר ללקוחות לבחור עובד ספציפי</p>
            </div>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>שומר...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>שמור שינויים</span>
            </>
          )}
        </button>

        <a
          href={`/${business.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          תצוגה מקדימה
        </a>
      </div>
    </form>
  );
}

