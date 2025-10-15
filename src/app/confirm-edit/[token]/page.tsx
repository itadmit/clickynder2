'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, X, Clock, Calendar, Briefcase, User, AlertCircle } from 'lucide-react';

export default function ConfirmEditPage() {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'rejected' | 'error'>('pending');
  const [message, setMessage] = useState('');

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments/confirm-edit/${params.token}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('confirmed');
        setMessage('התור עודכן בהצלחה! תקבל/י הודעת אישור בהקדם.');
      } else {
        setStatus('error');
        setMessage(data.error || 'שגיאה באישור השינוי');
      }
    } catch (error) {
      setStatus('error');
      setMessage('שגיאה באישור השינוי');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments/confirm-edit/${params.token}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('rejected');
        setMessage('בקשת העריכה נדחתה. התור המקורי נשאר בתוקף.');
      } else {
        setStatus('error');
        setMessage(data.error || 'שגיאה בדחיית השינוי');
      }
    } catch (error) {
      setStatus('error');
      setMessage('שגיאה בדחיית השינוי');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">Clickinder</h1>
          <p className="text-gray-600">ניהול תורים חכם</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {status === 'pending' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <AlertCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  בקשה לשינוי תור
                </h2>
                <p className="text-gray-600">
                  העסק ביקש לשנות את פרטי התור שלך
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">פרטי התור החדש:</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">תאריך ושעה חדשים</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">שירות</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">מטפל/ת</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                  <span>{isLoading ? 'מאשר...' : 'אני מאשר/ת את השינוי'}</span>
                </button>
                <button
                  onClick={handleReject}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  <span>{isLoading ? 'דוחה...' : 'אני דוחה/ה את השינוי'}</span>
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-6">
                בחירתך תשלח לעסק מיד ותקבל/י הודעת אישור
              </p>
            </>
          )}

          {status === 'confirmed' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                התור עודכן בהצלחה!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  נשלחה אליך הודעת אישור עם הפרטים המעודכנים
                </p>
              </div>
            </div>
          )}

          {status === 'rejected' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <X className="w-10 h-10 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                השינוי נדחה
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  התור המקורי שלך נשאר בתוקף
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                שגיאה
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => setStatus('pending')}
                className="btn btn-primary"
              >
                נסה שוב
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            מופעל על ידי <span className="font-semibold text-primary-600">Clickinder</span>
          </p>
        </div>
      </div>
    </div>
  );
}

