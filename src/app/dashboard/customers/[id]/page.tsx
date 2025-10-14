'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Briefcase,
  ArrowRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  createdAt: string;
  business?: {
    currency: string;
  };
  appointments: Array<{
    id: string;
    startAt: string;
    endAt: string;
    status: string;
    priceCents: number;
    confirmationCode: string;
    service: {
      name: string;
    };
    staff: {
      name: string;
    };
  }>;
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }
      const data = await response.json();
      setCustomer(data);
    } catch (error) {
      toast.error('שגיאה בטעינת הלקוח');
      router.push('/dashboard/customers');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('he-IL', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  const getStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      pending: 'ממתין',
      confirmed: 'מאושר',
      completed: 'הושלם',
      canceled: 'בוטל',
      no_show: 'לא הגיע',
    };
    return statusLabels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div>
        <DashboardHeader title="פרטי לקוח" subtitle="טוען..." />
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="space-y-6">
            {/* Customer Info Skeleton */}
            <div className="card animate-pulse">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-16 w-16 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-48" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-8 bg-gray-200 rounded w-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Appointments Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-20 bg-gray-100 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const totalSpent = customer.appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + a.priceCents, 0);

  const upcomingAppointments = customer.appointments.filter(
    (a) =>
      (a.status === 'confirmed' || a.status === 'pending') &&
      new Date(a.startAt) > new Date()
  );

  const pastAppointments = customer.appointments.filter(
    (a) =>
      a.status === 'completed' ||
      a.status === 'canceled' ||
      a.status === 'no_show' ||
      new Date(a.startAt) <= new Date()
  );

  return (
    <div>
      <DashboardHeader title="פרטי לקוח" subtitle={`${customer.firstName} ${customer.lastName}`} />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">{customer.firstName} {customer.lastName}</h2>
                  <div className="space-y-1 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <a
                        href={`tel:${customer.phone}`}
                        className="hover:text-primary-600"
                      >
                        {customer.phone}
                      </a>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <a
                          href={`mailto:${customer.email}`}
                          className="hover:text-primary-600"
                        >
                          {customer.email}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>לקוח מאז {formatDate(customer.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-600">
                  {customer.appointments.length}
                </p>
                <p className="text-gray-600 text-sm">סה״כ תורים</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {upcomingAppointments.length}
                </p>
                <p className="text-gray-600 text-sm">תורים קרובים</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(totalSpent, customer.business?.currency || 'ILS')}
                </p>
                <p className="text-gray-600 text-sm">סה״כ הוצאה</p>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                תורים קרובים
              </h3>
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/appointments/${appointment.id}`)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>
                        <p className="font-medium text-lg">
                          {appointment.service.name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(appointment.startAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(appointment.startAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {appointment.staff.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-xl font-bold text-primary-600">
                          {formatPrice(appointment.priceCents, customer.business?.currency || 'ILS')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              היסטוריית תורים
            </h3>
            {pastAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                אין היסטוריית תורים
              </p>
            ) : (
              <div className="space-y-3">
                {pastAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/appointments/${appointment.id}`)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {appointment.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>
                        <p className="font-medium">{appointment.service.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(appointment.startAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(appointment.startAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {appointment.staff.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-bold text-gray-600">
                          {formatPrice(appointment.priceCents, customer.business?.currency || 'ILS')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/dashboard/customers')}
              className="btn btn-secondary flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>חזרה ללקוחות</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

