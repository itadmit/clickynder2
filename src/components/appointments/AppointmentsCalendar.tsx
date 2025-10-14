'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Appointment, Customer, Service, Staff, Branch } from '@prisma/client';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { he } from 'date-fns/locale';

type AppointmentWithRelations = Appointment & {
  customer: Customer;
  service: Service;
  staff: Staff | null;
  branch: Branch | null;
};

interface AppointmentsCalendarProps {
  businessId: string;
  initialAppointments: AppointmentWithRelations[];
  staff: Staff[];
  services: Service[];
  branches: Branch[];
}

export function AppointmentsCalendar({
  businessId,
  initialAppointments,
  staff,
}: AppointmentsCalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

  const goToPreviousWeek = () => setCurrentDate((prev) => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentDate((prev) => addWeeks(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="card">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousWeek}
            className="btn btn-secondary p-2"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={goToToday}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            <span>היום</span>
          </button>

          <button
            onClick={goToNextWeek}
            className="btn btn-secondary p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-bold">
            {format(weekStart, 'MMMM yyyy', { locale: he })}
          </h3>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded-lg ${
              view === 'day' ? 'bg-primary-600 text-white' : 'bg-gray-200'
            }`}
          >
            יום
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg ${
              view === 'week' ? 'bg-primary-600 text-white' : 'bg-gray-200'
            }`}
          >
            שבוע
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-2 text-sm font-medium text-gray-600">שעה</div>
            {days.map((day) => {
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div
                  key={day.toString()}
                  className={`p-2 text-center ${isToday ? 'bg-primary-50' : ''}`}
                >
                  <div className="text-sm font-medium">
                    {format(day, 'EEEE', { locale: he })}
                  </div>
                  <div className={`text-2xl font-bold ${isToday ? 'text-primary-600' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Slots */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-8 border-b border-gray-100"
            >
              <div className="p-2 text-sm text-gray-600 font-medium">
                {`${hour}:00`}
              </div>
              {days.map((day) => {
                const dayAppointments = initialAppointments.filter((apt) => {
                  const aptDate = new Date(apt.startAt);
                  return (
                    format(aptDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') &&
                    aptDate.getHours() === hour
                  );
                });

                return (
                  <div
                    key={`${day}-${hour}`}
                    className="p-1 min-h-[60px] border-l border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {dayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        onClick={() => router.push(`/dashboard/appointments/${apt.id}`)}
                        className="text-xs p-2 mb-1 rounded bg-primary-100 border-r-2 border-primary-600 cursor-pointer hover:bg-primary-200 transition-colors"
                        style={
                          apt.staff?.calendarColor
                            ? {
                                backgroundColor: `${apt.staff.calendarColor}20`,
                                borderRightColor: apt.staff.calendarColor,
                              }
                            : undefined
                        }
                      >
                        <div className="font-medium truncate">
                          {apt.customer.firstName} {apt.customer.lastName}
                        </div>
                        <div className="text-gray-600 truncate">
                          {apt.service.name}
                        </div>
                        {apt.staff && (
                          <div className="text-gray-500 text-xs truncate">
                            {apt.staff.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      {staff.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-4">
          {staff.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: member.calendarColor || '#0ea5e9' }}
              />
              <span className="text-sm">{member.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

