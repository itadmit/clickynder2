import Link from 'next/link';
import { Home, Search, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mb-6 animate-bounce">
              <Search className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-4">
              404
            </h1>
          </div>

          {/* Message */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              הדף לא נמצא
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              מצטערים, הדף שחיפשת אינו קיים.
            </p>
            <p className="text-gray-500">
              ייתכן שהקישור שגוי או שהדף הוסר.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5" />
              <span>חזרה לדף הבית</span>
            </Link>
            
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <span>התחברות</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              צריך עזרה? צור קשר עם{' '}
              <a href="mailto:support@clickinder.co.il" className="text-primary-600 hover:underline">
                התמיכה שלנו
              </a>
            </p>
          </div>
        </div>

        {/* Clickinder Branding */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            <span className="font-bold text-primary-600">Clickinder</span>
            {' '}- מערכת ניהול תורים חכמה
          </p>
        </div>
      </div>
    </div>
  );
}

