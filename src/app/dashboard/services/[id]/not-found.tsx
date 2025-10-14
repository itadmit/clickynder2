import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function ServiceNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          שירות לא נמצא
        </h1>
        <p className="text-gray-600 mb-8">
          השירות שחיפשת לא נמצא במערכת או שאינך מורשה לצפות בו.
        </p>
        <Link
          href="/dashboard/services"
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          <span>חזרה לרשימת השירותים</span>
        </Link>
      </div>
    </div>
  );
}


