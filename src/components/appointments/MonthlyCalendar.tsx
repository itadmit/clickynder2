'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Appointment, Customer, Service, Staff, Branch } from '@prisma/client';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
import { he } from 'date-fns/locale';

type AppointmentWithRelations = Appointment & {
  customer: Customer;
  service: Service;
  staff: Staff | null;
  branch: Branch | null;
};

interface MonthlyCalendarProps {
  appointments: AppointmentWithRelations[];
  showAppointmentsList?: boolean;
}

export function MonthlyCalendar({ 
  appointments, 
  showAppointmentsList = true 
}: MonthlyCalendarProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // ברירת מחדל - היום

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startAt);
      return isSameDay(aptDate, day);
    });
  };

  // Get appointments for selected date
  const selectedDateAppointments = selectedDate 
    ? getAppointmentsForDay(selectedDate).sort((a, b) => 
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      )
    : [];

  // Generate calendar days
  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Group days into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="חודש קודם"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm hover:bg-gray-100 rounded-lg transition-colors"
          >
            היום
          </button>
          <h3 className="text-lg font-bold">
            {format(currentMonth, 'MMMM yyyy', { locale: he })}
          </h3>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="חודש הבא"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day, i) => (
            <div
              key={i}
              className="text-center text-xs font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((day, dayIndex) => {
                const dayAppointments = getAppointmentsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={dayIndex}
                    onClick={() => {
                      if (isCurrentMonth) {
                        setSelectedDate(isSameDay(day, selectedDate || new Date('1970-01-01')) ? null : day);
                      }
                    }}
                    className={`
                      relative min-h-[60px] p-2 border-b border-l border-gray-200
                      transition-colors
                      ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'hover:bg-blue-50'}
                      ${isSelected ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset' : ''}
                      ${isTodayDate && !isSelected ? 'bg-blue-50' : ''}
                    `}
                    disabled={!isCurrentMonth}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`
                          text-sm font-medium
                          ${isTodayDate ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}
                          ${!isCurrentMonth ? 'text-gray-400' : ''}
                        `}
                      >
                        {format(day, 'd')}
                      </span>

                      {/* Appointment Indicators */}
                      {isCurrentMonth && dayAppointments.length > 0 && (
                        <div className="flex items-center gap-0.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: dayAppointments[0].staff?.calendarColor || '#0ea5e9'
                            }}
                          />
                          {dayAppointments.length > 1 && (
                            <span className="text-[9px] text-gray-600 font-medium">
                              +{dayAppointments.length - 1}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Day Appointments */}
      {showAppointmentsList && selectedDate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-lg">
              {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: he })}
            </h3>
          </div>

          {selectedDateAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">אין תורים</p>
              <p className="text-xs mt-1 text-gray-400">ליום זה</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateAppointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => router.push(`/dashboard/appointments/${apt.id}`)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {/* Time */}
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-bold text-primary-600">
                      {format(new Date(apt.startAt), 'HH:mm', { locale: he })}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        apt.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : apt.status === 'canceled'
                          ? 'bg-red-100 text-red-700'
                          : apt.status === 'completed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>

                  {/* Customer & Service */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: apt.staff?.calendarColor || '#0ea5e9'
                        }}
                      >
                        {apt.customer.firstName.charAt(0)}
                        {apt.customer.lastName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {apt.customer.firstName} {apt.customer.lastName}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {apt.service.name}
                        </p>
                      </div>
                    </div>
                    
                    {/* Staff */}
                    {apt.staff && (
                      <p className="text-xs text-gray-500 mr-10">
                        עם {apt.staff.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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

