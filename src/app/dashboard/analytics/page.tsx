import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { formatPrice } from '@/lib/utils';
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const business = await prisma.business.findFirst({
    where: {
      ownerUserId: session.user.id,
    },
  });

  if (!business) {
    return <div>לא נמצא עסק</div>;
  }

  // Get date ranges
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Current month stats
  const [
    totalAppointments,
    completedAppointments,
    canceledAppointments,
    pendingAppointments,
    totalRevenue,
    uniqueCustomers,
  ] = await Promise.all([
    // Total appointments this month
    prisma.appointment.count({
      where: {
        businessId: business.id,
        startAt: { gte: startOfMonth },
      },
    }),
    // Completed appointments
    prisma.appointment.count({
      where: {
        businessId: business.id,
        startAt: { gte: startOfMonth },
        status: 'completed',
      },
    }),
    // Canceled appointments
    prisma.appointment.count({
      where: {
        businessId: business.id,
        startAt: { gte: startOfMonth },
        status: 'canceled',
      },
    }),
    // Pending appointments
    prisma.appointment.count({
      where: {
        businessId: business.id,
        startAt: { gte: startOfMonth },
        status: { in: ['pending', 'confirmed'] },
      },
    }),
    // Total revenue
    prisma.appointment.aggregate({
      where: {
        businessId: business.id,
        startAt: { gte: startOfMonth },
        status: 'completed',
      },
      _sum: {
        priceCents: true,
      },
    }),
    // Unique customers
    prisma.appointment.findMany({
      where: {
        businessId: business.id,
        startAt: { gte: startOfMonth },
      },
      select: {
        customerId: true,
      },
      distinct: ['customerId'],
    }),
  ]);

  // Last month stats for comparison
  const [lastMonthAppointments, lastMonthRevenue] = await Promise.all([
    prisma.appointment.count({
      where: {
        businessId: business.id,
        startAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    }),
    prisma.appointment.aggregate({
      where: {
        businessId: business.id,
        startAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
        status: 'completed',
      },
      _sum: {
        priceCents: true,
      },
    }),
  ]);

  // Calculate percentages
  const appointmentsGrowth =
    lastMonthAppointments > 0
      ? ((totalAppointments - lastMonthAppointments) / lastMonthAppointments) * 100
      : 0;

  const revenueGrowth =
    (lastMonthRevenue._sum.priceCents || 0) > 0
      ? (((totalRevenue._sum.priceCents || 0) - (lastMonthRevenue._sum.priceCents || 0)) /
          (lastMonthRevenue._sum.priceCents || 0)) *
        100
      : 0;

  const completionRate =
    totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

  // Top services
  const topServices = await prisma.appointment.groupBy({
    by: ['serviceId'],
    where: {
      businessId: business.id,
      startAt: { gte: startOfMonth },
    },
    _count: {
      serviceId: true,
    },
    orderBy: {
      _count: {
        serviceId: 'desc',
      },
    },
    take: 5,
  });

  const servicesWithNames = await prisma.service.findMany({
    where: {
      id: {
        in: topServices.map((s) => s.serviceId),
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const topServicesData = topServices.map((s) => ({
    name: servicesWithNames.find((sn) => sn.id === s.serviceId)?.name || 'לא ידוע',
    count: s._count.serviceId,
  }));

  const stats = [
    {
      title: 'סה"כ תורים החודש',
      value: totalAppointments,
      change: appointmentsGrowth,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'הכנסות החודש',
      value: formatPrice(totalRevenue._sum.priceCents || 0, business.currency),
      change: revenueGrowth,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'לקוחות ייחודיים',
      value: uniqueCustomers.length,
      change: null,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'אחוז השלמה',
      value: `${completionRate.toFixed(0)}%`,
      change: null,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <DashboardHeader
        title="סטטיסטיקות ואנליטיקס"
        subtitle="מעקב אחר ביצועי העסק שלך"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="card">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                {stat.change !== null && (
                  <p
                    className={`text-sm flex items-center gap-1 ${
                      stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change >= 0 ? '↑' : '↓'}{' '}
                    {Math.abs(stat.change).toFixed(1)}% מהחודש שעבר
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">פילוח סטטוס תורים</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">הושלמו</p>
                    <p className="text-sm text-green-700">
                      {completionRate.toFixed(0)}% מהתורים
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {completedAppointments}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">ממתינים/מאושרים</p>
                    <p className="text-sm text-blue-700">תורים פעילים</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {pendingAppointments}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900">בוטלו</p>
                    <p className="text-sm text-red-700">
                      {totalAppointments > 0
                        ? ((canceledAppointments / totalAppointments) * 100).toFixed(0)
                        : 0}
                      % מהתורים
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-900">
                  {canceledAppointments}
                </p>
              </div>
            </div>
          </div>

          {/* Top Services */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">השירותים הפופולריים</h2>
            {topServicesData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>אין עדיין נתונים להצגה</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topServicesData.map((service, index) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <p className="font-medium">{service.name}</p>
                    </div>
                    <p className="text-lg font-bold text-primary-600">
                      {service.count}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="card bg-blue-50 border-blue-200 mt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-1">
                הסטטיסטיקות מתעדכנות בזמן אמת
              </h3>
              <p className="text-blue-800 text-sm">
                כל הנתונים מתייחסים לחודש הנוכחי (
                {new Intl.DateTimeFormat('he-IL', {
                  month: 'long',
                  year: 'numeric',
                }).format(now)}
                ) ומושווים לחודש הקודם.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

