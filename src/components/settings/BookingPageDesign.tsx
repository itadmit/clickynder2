'use client';

import { useState } from 'react';
import { Business } from '@prisma/client';
import { Save, Upload, Palette, Layout, Sparkles, Square, Menu, Type } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface BookingPageDesignProps {
  business: Business;
}

const templates = [
  {
    id: 'modern',
    name: 'קלאסי',
    description: 'דף אחד ישיר - הלקוח נכנס ומזמין מיד',
    icon: Sparkles,
    gradient: 'from-blue-500 to-purple-600',
  },
  {
    id: 'classic',
    name: 'מודרני',
    description: 'דף בית + מודל הזמנה - לוגו, שירותים וכפתור',
    icon: Square,
    gradient: 'from-gray-600 to-gray-800',
  },
  {
    id: 'minimal',
    name: 'תפריט ספא',
    description: 'עיצוב אלגנטי בסגנון תפריט מסעדה - מושלם לספא',
    icon: Menu,
    gradient: 'from-amber-500 to-orange-600',
  },
];

const fonts = [
  { id: 'Noto Sans Hebrew', name: 'Noto Sans Hebrew', example: 'שלום' },
  { id: 'Assistant', name: 'Assistant', example: 'שלום' },
  { id: 'Heebo', name: 'Heebo', example: 'שלום' },
  { id: 'Rubik', name: 'Rubik', example: 'שלום' },
  { id: 'Varela Round', name: 'Varela Round', example: 'שלום' },
];

export function BookingPageDesign({ business }: BookingPageDesignProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    logoUrl: business.logoUrl || '',
    templateStyle: business.templateStyle || 'modern',
    primaryColor: business.primaryColor || '#3b82f6',
    secondaryColor: business.secondaryColor || '#d946ef',
    backgroundColorStart: business.backgroundColorStart || '#dbeafe',
    backgroundColorEnd: business.backgroundColorEnd || '#faf5ff',
    font: business.font || 'Noto Sans Hebrew',
    description: business.description || '',
    showBranches: business.showBranches,
    showStaff: business.showStaff,
    developerMode: business.developerMode || false,
    customCss: business.customCss || '',
    customJs: business.customJs || '',
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
          לוגו ותיאור העסק
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

        {/* Description - Moved here */}
        <div className="mt-6">
          <label htmlFor="description" className="form-label">תיאור העסק</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="form-input"
            rows={4}
            placeholder="ספר קצת על העסק שלך... התיאור יוצג בעמוד קביעת התורים"
          />
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
          <div className="lg:w-96 flex-shrink-0">
            <div className="sticky top-8">
              <div className="text-sm font-semibold text-gray-700 mb-3 text-center">תצוגה מקדימה</div>
              {/* iPhone Frame */}
              <div className="relative mx-auto w-80 h-[680px]">
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
                        <div 
                          className="h-full flex flex-col"
                          style={{ 
                            fontFamily: `'${formData.font}', sans-serif`,
                            background: `linear-gradient(to bottom right, ${formData.backgroundColorStart}, ${formData.backgroundColorEnd})`
                          }}
                        >
                          {/* Header */}
                          <div 
                            className="py-2 px-2 flex items-center justify-center gap-1.5"
                            style={{
                              backgroundColor: formData.primaryColor ? `${formData.primaryColor}B3` : '#3b82f6B3'
                            }}
                          >
                            {formData.logoUrl && (
                              <img 
                                src={formData.logoUrl} 
                                alt="Logo" 
                                className="w-5 h-5 object-contain rounded bg-white/90 p-0.5"
                              />
                            )}
                            <div className="text-white text-center">
                              <div className="text-[10px] font-bold leading-tight">{business.name}</div>
                              {formData.description && (
                                <div className="text-[7px] opacity-90">{formData.description.slice(0, 20)}...</div>
                              )}
                            </div>
                          </div>

                          {/* Progress Steps */}
                          <div className="flex items-center justify-center gap-1 py-2">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: formData.primaryColor }}>1</div>
                              <div className="w-4 h-0.5" style={{ backgroundColor: `${formData.primaryColor}40` }}></div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ backgroundColor: `${formData.primaryColor}20`, color: formData.primaryColor }}>2</div>
                              <div className="w-4 h-0.5 bg-gray-300"></div>
                            </div>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold bg-gray-200 text-gray-500">3</div>
                          </div>

                          {/* Title */}
                          <div className="px-3 py-2">
                            <div className="text-[12px] font-bold text-center mb-1">בחר שירות</div>
                            <div className="text-[8px] text-gray-600 text-center">איזה שירות תרצה לקבל?</div>
                          </div>

                          {/* Content - Skeleton Loaders */}
                          <div className="flex-1 px-2 overflow-y-auto">
                            <div className="space-y-1.5 mb-3">
                              {/* Skeleton 1 */}
                              <div className="bg-white rounded-lg p-2 shadow-sm">
                                <div className="h-2.5 rounded" style={{ backgroundColor: `${formData.primaryColor}20`, width: '60%' }}></div>
                                <div className="flex justify-between items-center mt-1">
                                  <div className="h-2 rounded" style={{ backgroundColor: `${formData.primaryColor}15`, width: '25%' }}></div>
                                  <div className="h-2.5 rounded" style={{ backgroundColor: `${formData.primaryColor}30`, width: '20%' }}></div>
                                </div>
                              </div>
                              {/* Skeleton 2 */}
                              <div className="bg-white rounded-lg p-2 shadow-sm">
                                <div className="h-2.5 rounded" style={{ backgroundColor: `${formData.primaryColor}20`, width: '55%' }}></div>
                                <div className="flex justify-between items-center mt-1">
                                  <div className="h-2 rounded" style={{ backgroundColor: `${formData.primaryColor}15`, width: '25%' }}></div>
                                  <div className="h-2.5 rounded" style={{ backgroundColor: `${formData.primaryColor}30`, width: '20%' }}></div>
                                </div>
                              </div>
                              {/* Skeleton 3 */}
                              <div className="bg-white rounded-lg p-2 shadow-sm">
                                <div className="h-2.5 rounded" style={{ backgroundColor: `${formData.primaryColor}20`, width: '50%' }}></div>
                                <div className="flex justify-between items-center mt-1">
                                  <div className="h-2 rounded" style={{ backgroundColor: `${formData.primaryColor}15`, width: '25%' }}></div>
                                  <div className="h-2.5 rounded" style={{ backgroundColor: `${formData.primaryColor}30`, width: '20%' }}></div>
                                </div>
                              </div>
                            </div>

                            {/* CTA Button */}
                            <div
                              className="text-white text-[10px] font-bold py-2 rounded-lg text-center shadow-sm"
                              style={{ backgroundColor: formData.primaryColor }}
                            >
                              המשך
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="py-1 text-center">
                            <div className="text-[6px] text-gray-600">
                              מופעל על ידי <span className="font-semibold" style={{ color: formData.primaryColor }}>Clickinder</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.templateStyle === 'classic' && (
                        <div 
                          className="h-full flex flex-col"
                          style={{ 
                            fontFamily: `'${formData.font}', sans-serif`,
                            background: `linear-gradient(to bottom right, ${formData.backgroundColorStart}, ${formData.backgroundColorEnd})`
                          }}
                        >
                          {/* Logo and Business Name - Centered */}
                          <div className="bg-white rounded-lg shadow-sm p-3 m-2 text-center">
                            {formData.logoUrl ? (
                              <img
                                src={formData.logoUrl}
                                alt="Logo"
                                className="w-8 h-8 rounded-full object-cover mx-auto mb-1 shadow-sm border"
                                style={{
                                  boxShadow: `0 2px 10px ${formData.primaryColor}40`,
                                  borderColor: `${formData.primaryColor}40`
                                }}
                              />
                            ) : (
                              <div 
                                className="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-sm"
                                style={{ backgroundColor: formData.primaryColor }}
                              >
                                {business.name.charAt(0)}
                              </div>
                            )}
                            <div className="text-[11px] font-bold">{business.name}</div>
                            {formData.description && (
                              <div className="text-[7px] text-gray-600 mt-0.5">{formData.description.slice(0, 25)}...</div>
                            )}
                          </div>

                          {/* Services Title */}
                          <div className="px-3 pb-2">
                            <div className="text-[11px] font-bold text-center">השירותים שלנו</div>
                          </div>

                          {/* Services - Skeleton Loaders */}
                          <div className="flex-1 px-2 overflow-y-auto">
                            <div className="space-y-1.5 mb-3">
                              {/* Skeleton 1 */}
                              <div
                                className="relative rounded-lg p-0.5"
                                style={{
                                  background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`,
                                }}
                              >
                                <div className="bg-white rounded-lg p-2">
                                  <div className="h-2 rounded mb-1" style={{ backgroundColor: `${formData.primaryColor}25`, width: '60%' }}></div>
                                  <div className="flex justify-between items-center mt-0.5">
                                    <div className="h-1.5 rounded" style={{ backgroundColor: `${formData.primaryColor}15`, width: '25%' }}></div>
                                    <div 
                                      className="h-2.5 w-9 rounded-full"
                                      style={{ 
                                        background: `linear-gradient(135deg, ${formData.primaryColor}30, ${formData.secondaryColor}30)`,
                                      }}
                                    >
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Skeleton 2 */}
                              <div
                                className="relative rounded-lg p-0.5"
                                style={{
                                  background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`,
                                }}
                              >
                                <div className="bg-white rounded-lg p-2">
                                  <div className="h-1.5 rounded mb-1" style={{ backgroundColor: `${formData.primaryColor}25`, width: '55%' }}></div>
                                  <div className="flex justify-between items-center mt-0.5">
                                    <div className="h-1 rounded" style={{ backgroundColor: `${formData.primaryColor}15`, width: '25%' }}></div>
                                    <div 
                                      className="h-2 w-8 rounded-full"
                                      style={{ 
                                        background: `linear-gradient(135deg, ${formData.primaryColor}30, ${formData.secondaryColor}30)`,
                                      }}
                                    >
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Skeleton 3 */}
                              <div
                                className="relative rounded-lg p-0.5"
                                style={{
                                  background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`,
                                }}
                              >
                                <div className="bg-white rounded-lg p-2">
                                  <div className="h-1.5 rounded mb-1" style={{ backgroundColor: `${formData.primaryColor}25`, width: '50%' }}></div>
                                  <div className="flex justify-between items-center mt-0.5">
                                    <div className="h-1 rounded" style={{ backgroundColor: `${formData.primaryColor}15`, width: '25%' }}></div>
                                    <div 
                                      className="h-2 w-8 rounded-full"
                                      style={{ 
                                        background: `linear-gradient(135deg, ${formData.primaryColor}30, ${formData.secondaryColor}30)`,
                                      }}
                                    >
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* CTA Button */}
                            <div
                              className="text-white text-[9px] font-bold py-2 rounded-lg text-center shadow-sm"
                              style={{
                                background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`,
                              }}
                            >
                              קביעת תור
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="py-1 text-center">
                            <div className="text-[6px] text-gray-600">
                              מופעל על ידי <span className="font-semibold" style={{ color: formData.primaryColor }}>Clickinder</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.templateStyle === 'minimal' && (
                        <div 
                          className="h-full flex flex-col"
                          style={{ 
                            fontFamily: `'${formData.font}', sans-serif`,
                            background: `linear-gradient(to bottom right, ${formData.backgroundColorStart}, ${formData.backgroundColorEnd})`
                          }}
                        >
                          {/* Elegant Header */}
                          <div className="text-center py-3 px-2">
                            {formData.logoUrl && (
                              <img
                                src={formData.logoUrl}
                                alt="Logo"
                                className="h-6 w-6 object-contain mx-auto mb-1 opacity-90"
                              />
                            )}
                            
                            {/* Decorative Line */}
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <div className="h-px w-3" style={{ backgroundColor: formData.primaryColor }}></div>
                              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: formData.primaryColor }}></div>
                              <div className="h-px w-3" style={{ backgroundColor: formData.primaryColor }}></div>
                            </div>

                            <div 
                              className="text-[11px] mb-1"
                              style={{ color: formData.primaryColor, fontWeight: 900 }}
                            >
                              {business.name}
                            </div>
                            
                            {formData.description && (
                              <div className="text-[7px] text-gray-600 font-light italic">{formData.description.slice(0, 25)}...</div>
                            )}
                          </div>

                          {/* Menu-Style Services */}
                          <div className="flex-1 px-2 pb-2 overflow-y-auto">
                            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border" style={{ borderColor: `${formData.primaryColor}20` }}>
                              {/* Menu Header */}
                              <div className="text-center py-2 px-2 border-b" style={{ borderColor: `${formData.primaryColor}30` }}>
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <div className="w-1 h-1" style={{ backgroundColor: formData.primaryColor }}></div>
                                  <div 
                                    className="text-[9px]"
                                    style={{ color: formData.primaryColor, fontWeight: 900 }}
                                  >
                                    השירותים שלנו
                                  </div>
                                  <div className="w-1 h-1" style={{ backgroundColor: formData.primaryColor }}></div>
                                </div>
                              </div>

                              {/* Services List - Skeleton Loaders */}
                              <div className="p-2 space-y-1.5">
                                {/* Skeleton 1 */}
                                <div className="p-1 rounded">
                                  <div className="flex items-start justify-between mb-0.5">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <div className="h-2 rounded" style={{ backgroundColor: `${formData.primaryColor}30`, width: '50%' }}></div>
                                        <div className="flex-1 border-b border-dotted" style={{ borderColor: `${formData.primaryColor}20` }}></div>
                                      </div>
                                    </div>
                                    <div 
                                      className="h-2 w-7 rounded mr-1"
                                      style={{ backgroundColor: `${formData.primaryColor}30` }}
                                    >
                                    </div>
                                  </div>
                                  <div className="h-1 rounded mb-0.5" style={{ backgroundColor: `${formData.primaryColor}15`, width: '70%' }}></div>
                                  <div className="h-1 rounded" style={{ backgroundColor: `${formData.secondaryColor}25`, width: '30%' }}></div>
                                </div>
                                
                                <div className="h-px border-b" style={{ borderColor: `${formData.primaryColor}10` }}></div>
                                
                                {/* Skeleton 2 */}
                                <div className="p-1 rounded">
                                  <div className="flex items-start justify-between mb-0.5">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <div className="h-1.5 rounded" style={{ backgroundColor: `${formData.primaryColor}30`, width: '55%' }}></div>
                                        <div className="flex-1 border-b border-dotted" style={{ borderColor: `${formData.primaryColor}20` }}></div>
                                      </div>
                                    </div>
                                    <div 
                                      className="h-1.5 w-6 rounded mr-1"
                                      style={{ backgroundColor: `${formData.primaryColor}30` }}
                                    >
                                    </div>
                                  </div>
                                  <div className="h-0.5 rounded mb-0.5" style={{ backgroundColor: `${formData.primaryColor}15`, width: '65%' }}></div>
                                  <div className="h-0.5 rounded" style={{ backgroundColor: `${formData.secondaryColor}25`, width: '35%' }}></div>
                                </div>

                                <div className="h-px border-b" style={{ borderColor: `${formData.primaryColor}10` }}></div>
                                
                                {/* Skeleton 3 */}
                                <div className="p-1 rounded">
                                  <div className="flex items-start justify-between mb-0.5">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <div className="h-1.5 rounded" style={{ backgroundColor: `${formData.primaryColor}30`, width: '48%' }}></div>
                                        <div className="flex-1 border-b border-dotted" style={{ borderColor: `${formData.primaryColor}20` }}></div>
                                      </div>
                                    </div>
                                    <div 
                                      className="h-1.5 w-6 rounded mr-1"
                                      style={{ backgroundColor: `${formData.primaryColor}30` }}
                                    >
                                    </div>
                                  </div>
                                  <div className="h-0.5 rounded mb-0.5" style={{ backgroundColor: `${formData.primaryColor}15`, width: '60%' }}></div>
                                  <div className="h-0.5 rounded" style={{ backgroundColor: `${formData.secondaryColor}25`, width: '32%' }}></div>
                                </div>

                                <div className="h-px border-b" style={{ borderColor: `${formData.primaryColor}10` }}></div>
                                
                                {/* Skeleton 4 */}
                                <div className="p-1 rounded">
                                  <div className="flex items-start justify-between mb-0.5">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <div className="h-1.5 rounded" style={{ backgroundColor: `${formData.primaryColor}30`, width: '52%' }}></div>
                                        <div className="flex-1 border-b border-dotted" style={{ borderColor: `${formData.primaryColor}20` }}></div>
                                      </div>
                                    </div>
                                    <div 
                                      className="h-1.5 w-6 rounded mr-1"
                                      style={{ backgroundColor: `${formData.primaryColor}30` }}
                                    >
                                    </div>
                                  </div>
                                  <div className="h-0.5 rounded mb-0.5" style={{ backgroundColor: `${formData.primaryColor}15`, width: '68%' }}></div>
                                  <div className="h-0.5 rounded" style={{ backgroundColor: `${formData.secondaryColor}25`, width: '28%' }}></div>
                                </div>

                                <div className="h-px border-b" style={{ borderColor: `${formData.primaryColor}10` }}></div>
                                
                                {/* Skeleton 5 */}
                                <div className="p-1 rounded">
                                  <div className="flex items-start justify-between mb-0.5">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <div className="h-1.5 rounded" style={{ backgroundColor: `${formData.primaryColor}30`, width: '46%' }}></div>
                                        <div className="flex-1 border-b border-dotted" style={{ borderColor: `${formData.primaryColor}20` }}></div>
                                      </div>
                                    </div>
                                    <div 
                                      className="h-1.5 w-6 rounded mr-1"
                                      style={{ backgroundColor: `${formData.primaryColor}30` }}
                                    >
                                    </div>
                                  </div>
                                  <div className="h-0.5 rounded mb-0.5" style={{ backgroundColor: `${formData.primaryColor}15`, width: '62%' }}></div>
                                  <div className="h-0.5 rounded" style={{ backgroundColor: `${formData.secondaryColor}25`, width: '36%' }}></div>
                                </div>

                                <div className="h-px border-b" style={{ borderColor: `${formData.primaryColor}10` }}></div>
                                
                                {/* Skeleton 6 */}
                                <div className="p-1 rounded">
                                  <div className="flex items-start justify-between mb-0.5">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <div className="h-1.5 rounded" style={{ backgroundColor: `${formData.primaryColor}30`, width: '54%' }}></div>
                                        <div className="flex-1 border-b border-dotted" style={{ borderColor: `${formData.primaryColor}20` }}></div>
                                      </div>
                                    </div>
                                    <div 
                                      className="h-1.5 w-6 rounded mr-1"
                                      style={{ backgroundColor: `${formData.primaryColor}30` }}
                                    >
                                    </div>
                                  </div>
                                  <div className="h-0.5 rounded mb-0.5" style={{ backgroundColor: `${formData.primaryColor}15`, width: '66%' }}></div>
                                  <div className="h-0.5 rounded" style={{ backgroundColor: `${formData.secondaryColor}25`, width: '33%' }}></div>
                                </div>
                              </div>

                              {/* CTA Button */}
                              <div className="p-2 border-t" style={{ borderColor: `${formData.primaryColor}30` }}>
                                <div
                                  className="text-white text-[8px] font-semibold py-2 rounded-lg text-center shadow-md"
                                  style={{
                                    background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`
                                  }}
                                >
                                  לקביעת תור
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="text-center pt-3 pb-2">
                            <div className="flex items-center justify-center gap-1 mb-2">
                              <div className="h-px w-3" style={{ backgroundColor: formData.primaryColor }}></div>
                              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: formData.primaryColor }}></div>
                              <div className="h-px w-3" style={{ backgroundColor: formData.primaryColor }}></div>
                            </div>
                            
                            <div className="flex items-center justify-center gap-3 text-[7px] mb-2">
                              {business.phone && (
                                <div className="flex items-center gap-0.5" style={{ color: formData.primaryColor }}>
                                  <span className="font-light">{business.phone}</span>
                                </div>
                              )}
                              {business.email && (
                                <div className="flex items-center gap-0.5" style={{ color: formData.primaryColor }}>
                                  <span className="font-light">דוא"ל</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="text-center pb-2">
                            <div className="text-[5px] text-gray-400 font-light">
                              מופעל על ידי <span style={{ color: formData.primaryColor }}>Clickinder</span>
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

      {/* Font Selection */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Type className="w-5 h-5 text-primary-600" />
          בחירת פונט
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {fonts.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, font: font.id }))}
              className={`p-5 rounded-lg border-2 transition-all text-center ${
                formData.font === font.id
                  ? 'border-primary-600 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="text-xs font-medium text-gray-500 mb-3">{font.name}</div>
              <div 
                className="text-4xl font-black mb-2"
                style={{ fontFamily: `'${font.id}', sans-serif` }}
              >
                {font.example}
              </div>
              <div 
                className="text-base font-normal text-gray-600"
                style={{ fontFamily: `'${font.id}', sans-serif` }}
              >
                דוגמה לטקסט רגיל
              </div>
            </button>
          ))}
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

          {/* Secondary Color - Only for Classic template */}
          {formData.templateStyle === 'classic' && (
            <div>
              <label htmlFor="secondaryColor" className="form-label">
                צבע משני (Gradient)
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
              <p className="text-xs text-gray-500 mt-1">צבע שני ליצירת gradient בתבנית מודרני</p>
            </div>
          )}

          {/* Background Gradient Start Color */}
          <div>
            <label htmlFor="backgroundColorStart" className="form-label">
              צבע רקע התחלה
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={formData.backgroundColorStart}
                onChange={(e) => setFormData((prev) => ({ ...prev, backgroundColorStart: e.target.value }))}
                className="w-20 h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.backgroundColorStart}
                onChange={(e) => setFormData((prev) => ({ ...prev, backgroundColorStart: e.target.value }))}
                className="form-input flex-1"
                placeholder="#eff6ff"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">צבע התחלה של gradient הרקע</p>
          </div>

          {/* Background Gradient End Color */}
          <div>
            <label htmlFor="backgroundColorEnd" className="form-label">
              צבע רקע סיום
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={formData.backgroundColorEnd}
                onChange={(e) => setFormData((prev) => ({ ...prev, backgroundColorEnd: e.target.value }))}
                className="w-20 h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.backgroundColorEnd}
                onChange={(e) => setFormData((prev) => ({ ...prev, backgroundColorEnd: e.target.value }))}
                className="form-input flex-1"
                placeholder="#dbeafe"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">צבע סיום של gradient הרקע</p>
          </div>
        </div>
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

          <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={formData.developerMode}
              onChange={(e) => setFormData((prev) => ({ ...prev, developerMode: e.target.checked }))}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">מצב מתכנת</span>
              <p className="text-xs text-gray-500">הוסף CSS ו-JavaScript מותאם אישית לעמוד ההזמנה</p>
            </div>
          </label>
        </div>
      </div>

      {/* Developer Mode Section */}
      {formData.developerMode && (
        <div className="card border-2 border-purple-200 bg-purple-50/30">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
           
            מצב מתכנת
          </h3>
          
          <div className="space-y-6">
            {/* Custom CSS */}
            <div>
              <label htmlFor="customCss" className="form-label flex items-center gap-2">
                <span>קוד CSS מותאם אישית</span>
                <span className="text-xs text-gray-500 font-normal">(אופציונלי)</span>
              </label>
              <textarea
                id="customCss"
                value={formData.customCss}
                onChange={(e) => setFormData((prev) => ({ ...prev, customCss: e.target.value }))}
                className="form-input font-mono text-sm"
                rows={10}
                placeholder="/* הכנס כאן CSS מותאם אישית */&#10;.my-custom-class {&#10;  color: #ff0000;&#10;  font-size: 18px;&#10;}&#10;&#10;/* או הוסף תגית <style> */&#10;<style>&#10;  .header {&#10;    background: linear-gradient(to right, #667eea, #764ba2);&#10;  }&#10;</style>"
                dir="ltr"
                style={{ direction: 'ltr' }}
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 ניתן להוסיף CSS ישירות או בתוך תגית &lt;style&gt;. הקוד יתווסף ל-head של הדף.
              </p>
            </div>

            {/* Custom JavaScript */}
            <div>
              <label htmlFor="customJs" className="form-label flex items-center gap-2">
                <span>קוד JavaScript מותאם אישית</span>
                <span className="text-xs text-gray-500 font-normal">(אופציונלי)</span>
              </label>
              <textarea
                id="customJs"
                value={formData.customJs}
                onChange={(e) => setFormData((prev) => ({ ...prev, customJs: e.target.value }))}
                className="form-input font-mono text-sm"
                rows={10}
                placeholder="// הכנס כאן JavaScript מותאם אישית&#10;console.log('Hello from custom JS!');&#10;&#10;// או הוסף תגית <script>&#10;<script>&#10;  document.addEventListener('DOMContentLoaded', function() {&#10;    console.log('Page loaded!');&#10;  });&#10;</script>"
                dir="ltr"
                style={{ direction: 'ltr' }}
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 ניתן להוסיף JavaScript ישירות או בתוך תגית &lt;script&gt;. הקוד יתווסף ל-head של הדף.
              </p>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">שים לב!</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• קוד שגוי עלול לשבור את העמוד</li>
                    <li>• השתמש בכלי הזה רק אם יש לך ידע בפיתוח</li>
                    <li>• הקוד מתווסף לכל דפי ההזמנה של העסק</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

