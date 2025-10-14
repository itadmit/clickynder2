import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CopyLinkButton } from '@/components/dashboard/CopyLinkButton';
import { Calendar, Users, Scissors, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // שליפת העסק של המשתמש
  const business = await prisma.business.findFirst({
    where: {
      ownerUserId: session.user.id,
    },
    include: {
      _count: {
        select: {
          staff: true,
          services: true,
          branches: true,
          appointments: {
            where: {
              startAt: {
                gte: new Date(),
              },
              status: {
                not: 'canceled',
              },
            },
          },
        },
      },
    },
  });

  if (!business) {
    return <div>לא נמצא עסק</div>;
  }

  // שליפת התורים האחרונים (5 תורים אחרונים)
  const recentAppointments = await prisma.appointment.findMany({
    where: {
      businessId: business.id,
      status: {
        not: 'canceled',
      },
    },
    include: {
      customer: true,
      service: true,
      staff: true,
      branch: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  // סטטיסטיקות
  const stats = [
    {
      title: 'תורים קרובים',
      value: business._count.appointments,
      icon: Calendar,
      color: 'bg-blue-500',
      href: '/dashboard/appointments',
    },
    {
      title: 'עובדים',
      value: business._count.staff,
      icon: Users,
      color: 'bg-green-500',
      href: '/dashboard/staff',
    },
    {
      title: 'שירותים',
      value: business._count.services,
      icon: Scissors,
      color: 'bg-purple-500',
      href: '/dashboard/services',
    },
    {
      title: 'סניפים',
      value: business._count.branches,
      icon: TrendingUp,
      color: 'bg-orange-500',
      href: '/dashboard/branches',
    },
  ];

  const hasRequiredSetup = 
    business._count.services > 0 && 
    business._count.staff > 0 && 
    business._count.branches > 0;

  return (
    <>
      <DashboardHeader
        title={`שלום, ${session.user.name} 👋`}
        subtitle={`עסק: ${business.name}`}
      />

      <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
        {/* Setup Alert */}
        {!hasRequiredSetup && (
          <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 mb-6 w-full">
            <div className="flex items-start gap-2 md:gap-4">
              <div className="bg-yellow-400 rounded-full p-2 flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-yellow-900" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <h3 className="text-base md:text-xl font-bold text-yellow-900 mb-2">
                  עוד צעד אחד ותהיה מוכן
                </h3>
                <p className="text-xs md:text-base text-yellow-800 mb-3 md:mb-4">
                  כדי שהמערכת תעבוד בצורה מלאה:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-full">
                  {business._count.services === 0 && (
                    <Link
                      href="/dashboard/services/new"
                      className="flex items-center justify-between bg-white p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow group min-w-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm md:text-base">שירות ראשון</p>
                        <p className="text-xs md:text-sm text-gray-600">הוסף שירות</p>
                      </div>
                      <Plus className="w-4 h-4 md:w-5 md:h-5 text-primary-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                    </Link>
                  )}
                  {business._count.branches === 0 && (
                    <Link
                      href="/dashboard/branches/new"
                      className="flex items-center justify-between bg-white p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow group min-w-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm md:text-base">סניף ראשון</p>
                        <p className="text-xs md:text-sm text-gray-600">הוסף מיקום</p>
                      </div>
                      <Plus className="w-4 h-4 md:w-5 md:h-5 text-primary-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                    </Link>
                  )}
                  {business._count.staff === 0 && (
                    <Link
                      href="/dashboard/staff/new"
                      className="flex items-center justify-between bg-white p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow group min-w-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm md:text-base">ספק שירות</p>
                        <p className="text-xs md:text-sm text-gray-600">הוסף עובד</p>
                      </div>
                      <Plus className="w-4 h-4 md:w-5 md:h-5 text-primary-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Public Booking Link */}
        <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white w-full mb-8">
          <h2 className="text-base md:text-xl font-bold mb-2">עמוד ההזמנה הציבורי שלך</h2>
          <p className="text-xs md:text-base mb-3 md:mb-4 opacity-90">שתף את הלינק עם הלקוחות</p>
          <div className="bg-white/10 rounded-lg p-2 md:p-4 flex items-center gap-2 min-w-0 overflow-hidden">
            <code className="text-xs truncate flex-1 min-w-0 break-all">
              {`clickynder.com/${business.slug}`}
            </code>
            <div className="flex-shrink-0">
              <CopyLinkButton url={`https://clickynder.com/${business.slug}`} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.title}
                href={stat.href}
                className="card hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">פעולות מהירות</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/appointments/new"
              className="btn btn-primary text-center"
            >
              יצירת תור חדש
            </Link>
            <Link
              href="/dashboard/staff/new"
              className="btn btn-secondary text-center"
            >
              הוספת עובד
            </Link>
            <Link
              href="/dashboard/services/new"
              className="btn btn-secondary text-center"
            >
              הוספת שירות
            </Link>
          </div>
        </div>

        {/* Recent Appointments */}
        {recentAppointments.length > 0 && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">תורים אחרונים שנקבעו</h2>
              <Link 
                href="/dashboard/appointments" 
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                צפה בכל התורים ←
              </Link>
            </div>
            <div className="space-y-3">
              {recentAppointments.map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/dashboard/appointments/${appointment.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {appointment.customer.name}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700'
                            : appointment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {appointment.status === 'confirmed' ? 'מאושר' : 
                           appointment.status === 'pending' ? 'ממתין' : 
                           appointment.status === 'completed' ? 'הושלם' : 
                           'בוטל'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(appointment.startAt).toLocaleDateString('he-IL', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span>
                          {new Date(appointment.startAt).toLocaleTimeString('he-IL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {appointment.service && (
                          <span className="flex items-center gap-1">
                            <span>•</span>
                            {appointment.service.name}
                          </span>
                        )}
                        {appointment.staff && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {appointment.staff.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex-shrink-0">
                      נקבע {new Date(appointment.createdAt).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

