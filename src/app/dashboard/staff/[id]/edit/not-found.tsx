import Link from 'next/link';
import { ArrowRight, UserX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <UserX className="w-24 h-24 text-gray-400 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          עובד לא נמצא
        </h1>
        <p className="text-gray-600 mb-8">
          העובד שחיפשת אינו קיים או שאין לך הרשאה לצפות בו.
        </p>
        <Link
          href="/dashboard/staff"
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          <span>חזרה לרשימת העובדים</span>
        </Link>
      </div>
    </div>
  );
}

