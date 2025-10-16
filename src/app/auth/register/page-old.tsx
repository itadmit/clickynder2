'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, Building2, Phone, Eye, EyeOff, Sparkles, Zap, Shield } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    businessSlug: '',
  });
  const [slugError, setSlugError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from business name
    if (name === 'businessName' && !formData.businessSlug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, businessSlug: slug }));
    }

    // Validate slug format
    if (name === 'businessSlug') {
      const slugRegex = /^[a-z0-9-]+$/;
      if (value && !slugRegex.test(value)) {
        setSlugError('השתמש רק באותיות אנגליות קטנות, מספרים ומקפים');
      } else {
        setSlugError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (slugError) {
      toast.error('נא לתקן את השגיאות בטופס');
      return;
    }

    if (!formData.businessSlug) {
      toast.error('נא להזין כתובת אתר לעסק');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'אירעה שגיאה בהרשמה');
      }

      toast.success('החשבון נוצר בהצלחה! מעביר להתחברות...');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'אירעה שגיאה בהרשמה');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  // Don't render if authenticated (will redirect)
  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen flex overflow-hidden" dir="rtl">
      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-6 animate-fade-in my-8">
          {/* Logo */}
          <div className="text-center lg:text-right">
            <Link href="/">
              <img src="/assets/logo.png" alt="Clickinder" className="h-14 mb-4" />
            </Link>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              צור חשבון חדש
            </h2>
            <p className="text-gray-600">
              התחל להשתמש במערכת תוך דקות ספורות
            </p>
          </div>

          {/* Social Registration Buttons */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">
              התחברות דרך Google תהיה זמינה בקרוב להרשמה
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                או הירשם עם אימייל
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                שם מלא
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="שם פרטי ומשפחה"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                אימייל
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                טלפון <span className="text-gray-400">(אופציונלי)</span>
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="050-1234567"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                סיסמה
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pr-10 pl-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="לפחות 6 תווים"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                שם העסק
              </label>
              <div className="relative">
                <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="למשל: מספרת דוד"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Business Slug */}
            <div>
              <label htmlFor="businessSlug" className="block text-sm font-medium text-gray-700 mb-2">
                כתובת האתר שלך
              </label>
              <div className="relative">
                <input
                  id="businessSlug"
                  name="businessSlug"
                  type="text"
                  value={formData.businessSlug}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    slugError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="my-business"
                  required
                  disabled={isLoading}
                  dir="ltr"
                  style={{ textAlign: 'left' }}
                />
              </div>
              <div className="mt-2 space-y-1">
                {slugError ? (
                  <p className="text-sm text-red-600">{slugError}</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    הלקוחות שלך יוכלו לקבוע תור בכתובת:
                  </p>
                )}
                {formData.businessSlug && !slugError && (
                  <p className="text-sm text-blue-600 font-medium" dir="ltr" style={{ textAlign: 'left' }}>
                    clickinder.com/{formData.businessSlug}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>יוצר חשבון...</span>
                </div>
              ) : (
                'צור חשבון'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center pt-2">
            <span className="text-gray-600">כבר יש לך חשבון? </span>
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              התחבר
            </Link>
          </div>
        </div>
      </div>

      {/* Left Side - Feature Display */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 items-center justify-center relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-lg text-white space-y-8">
          {/* Main Feature Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              הצטרף לאלפי עסקים מצליחים.
            </h2>
            <p className="text-xl text-blue-100">
              התחל לנהל תורים, לקוחות ושירותים בצורה החכמה והיעילה ביותר.
            </p>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Sparkles className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium">קל לשימוש</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Zap className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium">מהיר ויעיל</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Shield className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium">מאובטח</p>
            </div>
          </div>

          {/* Slider Dots */}
          <div className="flex justify-center gap-2 pt-4">
            <div className="w-3 h-3 rounded-full bg-white/40"></div>
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <div className="w-3 h-3 rounded-full bg-white/40"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

