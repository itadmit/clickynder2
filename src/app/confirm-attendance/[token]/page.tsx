'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Calendar, User, Briefcase, MapPin, Loader2 } from 'lucide-react';

export default function ConfirmAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    appointment?: any;
  } | null>(null);

  const handleAction = async (action: 'confirm' | 'cancel') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/appointments/confirm-attendance/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({ success: false, message: data.error || 'שגיאה בעיבוד הבקשה' });
      } else {
        setResult(data);
      }
    } catch (error) {
      setResult({ success: false, message: 'שגיאת תקשורת עם השרת' });
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {result.success ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">מעולה!</h1>
                <p className="text-gray-600 mb-6">{result.message}</p>
                
                {result.appointment && (
                  <div className="bg-gray-50 rounded-lg p-4 text-right mb-6">
                    <p className="text-sm text-gray-600 mb-2">פרטי התור:</p>
                    <p className="font-semibold text-gray-900">{result.appointment.serviceName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(result.appointment.date).toLocaleDateString('he-IL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{result.appointment.businessName}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">אופס!</h1>
                <p className="text-gray-600 mb-6">{result.message}</p>
              </>
            )}

            <button
              onClick={() => window.close()}
              className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">אישור הגעה לתור</h1>
            <p className="text-blue-100">נשמח לדעת אם אתה מגיע</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-8">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center mb-6">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <p className="text-gray-700 leading-relaxed">
                  <strong>האם אתה מאשר הגעה לתור?</strong>
                  <br />
                  <span className="text-sm text-gray-600">
                    זה עוזר לנו להתארגן טוב יותר ולתת לך את השירות הטוב ביותר
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => handleAction('confirm')}
                disabled={loading}
                className="w-full py-4 px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    כן, אני מגיע! ✅
                  </>
                )}
              </button>

              <button
                onClick={() => handleAction('cancel')}
                disabled={loading}
                className="w-full py-4 px-6 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-6 h-6" />
                    צריך לבטל את התור ❌
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              💡 לשאלות או בעיות, ניתן ליצור קשר ישירות עם העסק
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

