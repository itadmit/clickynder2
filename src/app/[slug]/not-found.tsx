import Link from 'next/link';
import { AlertTriangle, Home, Search } from 'lucide-react';

export default function BusinessNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6">
              <AlertTriangle className="w-12 h-12 text-orange-600" />
            </div>
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
              <span className="text-4xl font-bold text-gray-300">×</span>
            </div>
          </div>

          {/* Message */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              העסק לא נמצא
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              מצטערים, העסק שחיפשת אינו קיים במערכת.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-right">
              <p className="text-sm text-gray-700 mb-2">
                <strong>סיבות אפשריות:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>הקישור אינו נכון</li>
                <li>העסק הוסר מהמערכת</li>
                <li>כתובת האתר של העסק שונתה</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5" />
              <span>חזרה לדף הבית</span>
            </Link>
            
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <span>רישום עסק חדש</span>
            </Link>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>בעל עסק?</strong> יצרת עסק חדש ומחפש את דף ההזמנות?
              <br />
              הכתובת שלך תהיה: <code className="bg-blue-100 px-2 py-1 rounded">clickynder.com/שם-העסק-שלך</code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            מופעל על ידי{' '}
            <Link href="/" className="font-bold text-primary-600 hover:underline">
              Clickinder
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

