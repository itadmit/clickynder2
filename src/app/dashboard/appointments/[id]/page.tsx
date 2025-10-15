'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EditAppointmentModal } from '@/components/appointments/EditAppointmentModal';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  User,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Edit3,
} from 'lucide-react';

interface Appointment {
  id: string;
  businessId: string;
  startAt: string;
  endAt: string;
  status: string;
  priceCents: number;
  notesCustomer?: string;
  notesInternal?: string;
  confirmationCode: string;
  serviceId: string;
  staffId: string;
  business?: {
    currency: string;
  };
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  service: {
    name: string;
    durationMin: number;
  };
  staff: {
    name: string;
  };
  branch?: {
    name: string;
    address?: string;
  };
}

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notesInternal, setNotesInternal] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchAppointment();
  }, [params.id]);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointment');
      }
      const data = await response.json();
      setAppointment(data);
      setNotesInternal(data.notesInternal || '');
    } catch (error) {
      toast.error('שגיאה בטעינת התור');
      router.push('/dashboard/appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!appointment) return;

    const confirmMessage =
      newStatus === 'canceled'
        ? 'האם אתה בטוח שברצונך לבטל את התור?'
        : `האם לשנות את סטטוס התור ל-${getStatusLabel(newStatus)}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/appointments/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notesInternal,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      const updated = await response.json();
      setAppointment(updated);
      toast.success('התור עודכן בהצלחה');
    } catch (error) {
      toast.error('שגיאה בעדכון התור');
    } finally {
      setIsUpdating(false);
    }
  };

  const saveNotes = async () => {
    if (!appointment) return;

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/appointments/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notesInternal,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notes');
      }

      toast.success('ההערות נשמרו בהצלחה');
    } catch (error) {
      toast.error('שגיאה בשמירת ההערות');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      pending: 'ממתין לאישור',
      confirmed: 'מאושר',
      completed: 'הושלם',
      canceled: 'בוטל',
      no_show: 'לא הגיע',
    };
    return statusLabels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'canceled':
      case 'no_show':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div>
        <DashboardHeader title="פרטי תור" subtitle="טוען..." />
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Status Card Skeleton */}
            <div className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-48" />
            </div>
            
            {/* Details Skeleton */}
            <div className="card animate-pulse space-y-4">
              <div className="h-5 bg-gray-200 rounded w-40 mb-6" />
              <div className="grid grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-5 bg-gray-200 rounded w-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Skeleton */}
            <div className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
              <div className="h-20 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <div>
      <DashboardHeader
        title="פרטי תור"
        subtitle={`קוד אישור: ${appointment.confirmationCode}`}
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {getStatusIcon(appointment.status)}
                <div>
                  <h3 className="text-xl font-bold">
                    {getStatusLabel(appointment.status)}
                  </h3>
                  <p className="text-gray-600 text-sm">סטטוס התור</p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex gap-2">
                {appointment.status === 'pending' && (
                  <button
                    onClick={() => updateStatus('confirmed')}
                    disabled={isUpdating}
                    className="btn btn-success"
                  >
                    אשר תור
                  </button>
                )}
                {(appointment.status === 'pending' ||
                  appointment.status === 'confirmed') && (
                  <>
                    <button
                      onClick={() => updateStatus('completed')}
                      disabled={isUpdating}
                      className="btn btn-primary"
                    >
                      סמן כהושלם
                    </button>
                    <button
                      onClick={() => updateStatus('canceled')}
                      disabled={isUpdating}
                      className="btn btn-danger"
                    >
                      בטל תור
                    </button>
                  </>
                )}
                {appointment.status === 'confirmed' && (
                  <button
                    onClick={() => updateStatus('no_show')}
                    disabled={isUpdating}
                    className="btn btn-secondary"
                  >
                    לא הגיע
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointment Details */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">פרטי התור</h3>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 transition-colors group"
                >
                  <Edit3 className="w-4 h-4" />
                  <small className="text-xs font-medium">עריכה</small>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">תאריך</p>
                    <p className="font-medium">{formatDate(appointment.startAt)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">שעה</p>
                    <p className="font-medium">
                      {formatTime(appointment.startAt)}-{formatTime(appointment.endAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">שירות</p>
                    <p className="font-medium">{appointment.service.name}</p>
                    <p className="text-sm text-gray-500">
                      {appointment.service.durationMin} דקות
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">ספק שירות</p>
                    <p className="font-medium">{appointment.staff.name}</p>
                  </div>
                </div>

                {appointment.branch && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">סניף</p>
                      <p className="font-medium">{appointment.branch.name}</p>
                      {appointment.branch.address && (
                        <p className="text-sm text-gray-500">
                          {appointment.branch.address}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">מחיר</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {formatPrice(appointment.priceCents, appointment.business?.currency || 'ILS')}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">פרטי הלקוח</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">שם</p>
                    <p className="font-medium">{appointment.customer.firstName} {appointment.customer.lastName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">טלפון</p>
                    <a
                      href={`tel:${appointment.customer.phone}`}
                      className="font-medium text-primary-600 hover:text-primary-700"
                    >
                      {appointment.customer.phone}
                    </a>
                  </div>
                </div>

                {appointment.customer.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">אימייל</p>
                      <a
                        href={`mailto:${appointment.customer.email}`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        {appointment.customer.email}
                      </a>
                    </div>
                  </div>
                )}

                {appointment.notesCustomer && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">הערות הלקוח</p>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">
                        {appointment.notesCustomer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">הערות פנימיות</h3>
            <textarea
              value={notesInternal}
              onChange={(e) => setNotesInternal(e.target.value)}
              rows={4}
              className="form-input mb-4"
              placeholder="הוסף הערות פנימיות (לא יוצגו ללקוח)"
              disabled={isUpdating}
            />
            <button
              onClick={saveNotes}
              disabled={isUpdating}
              className="btn btn-primary"
            >
              {isUpdating ? 'שומר...' : 'שמור הערות'}
            </button>
          </div>

          {/* Back Button */}
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/dashboard/appointments')}
              className="btn btn-secondary flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>חזרה לתורים</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {appointment && (
        <EditAppointmentModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          appointmentId={appointment.id}
          currentData={{
            startAt: appointment.startAt,
            endAt: appointment.endAt,
            serviceId: appointment.serviceId,
            staffId: appointment.staffId,
            businessId: appointment.businessId,
          }}
          onSuccess={fetchAppointment}
        />
      )}
    </div>
  );
}

