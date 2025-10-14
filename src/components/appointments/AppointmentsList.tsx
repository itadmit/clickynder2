'use client';

import { Appointment, Customer, Service, Staff, Branch } from '@prisma/client';
import { Clock, User, Scissors, MapPin, Phone, Mail } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type AppointmentWithRelations = Appointment & {
  customer: Customer;
  service: Service;
  staff: Staff | null;
  branch: Branch | null;
};

interface AppointmentsListProps {
  appointments: AppointmentWithRelations[];
}

export function AppointmentsList({ appointments }: AppointmentsListProps) {
  const router = useRouter();

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>אין תורים להיום</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          onClick={() => router.push(`/dashboard/appointments/${appointment.id}`)}
          className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{
                  backgroundColor: appointment.staff?.calendarColor || '#0ea5e9',
                }}
              >
                {appointment.customer.firstName.charAt(0)}
                {appointment.customer.lastName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold">
                  {appointment.customer.firstName} {appointment.customer.lastName}
                </h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {appointment.customer.phone}
                  </span>
                  {appointment.customer.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {appointment.customer.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span
              className={`badge ${
                appointment.status === 'confirmed'
                  ? 'badge-success'
                  : appointment.status === 'canceled'
                  ? 'badge-danger'
                  : appointment.status === 'completed'
                  ? 'badge-info'
                  : 'badge-warning'
              }`}
            >
              {getStatusLabel(appointment.status)}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTime(appointment.startAt)}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Scissors className="w-4 h-4" />
              <span>{appointment.service.name}</span>
            </div>

            {appointment.staff && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{appointment.staff.name}</span>
              </div>
            )}

            {appointment.branch && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{appointment.branch.name}</span>
              </div>
            )}
          </div>

          {appointment.notesCustomer && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
              <span className="font-medium">הערות:</span> {appointment.notesCustomer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'ממתין',
    confirmed: 'מאושר',
    canceled: 'בוטל',
    no_show: 'לא הגיע',
    completed: 'הושלם',
  };
  return labels[status] || status;
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

