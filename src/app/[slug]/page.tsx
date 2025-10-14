import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BusinessInfoPage } from '@/components/booking/BusinessInfoPage';
import { AlertCircle, Settings, Phone, Mail } from 'lucide-react';

interface BookingPageProps {
  params: {
    slug: string;
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const business = await prisma.business.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      branches: {
        where: {
          active: true,
          deletedAt: null,
        },
      },
      services: {
        where: {
          active: true,
          deletedAt: null,
        },
        include: {
          category: true,
        },
      },
      staff: {
        where: {
          active: true,
          deletedAt: null,
        },
        include: {
          serviceStaff: {
            include: {
              service: true,
            },
          },
        },
      },
    },
  });

  if (!business) {
    notFound();
  }

  // Check if business is ready to accept bookings
  const hasServices = business.services.length > 0;
  const hasStaff = business.staff.length > 0;
  const hasBranches = business.branches.length > 0;
  const isReady = hasServices && hasStaff && hasBranches;

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 relative"
      style={{ 
        fontFamily: business.font || "'Noto Sans Hebrew', sans-serif"
      }}
    >

      {/* Header - Transparent */}
      <header className="py-4 px-4 sticky top-0 z-50 backdrop-blur-lg shadow-md bg-blue-500/70">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-center gap-4">
            {business.logoUrl && (
              <img 
                src={business.logoUrl} 
                alt={business.name}
                className="h-12 w-12 object-contain rounded-lg bg-white/90 p-2"
              />
            )}
            <div className="text-white text-center">
              <h1 className="text-xl md:text-2xl font-bold">{business.name}</h1>
              {business.description && (
                <p className="text-xs md:text-sm opacity-90 mt-0.5">
                  {business.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-4 py-8">
        {!isReady ? (
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                <Settings className="w-10 h-10 text-yellow-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                העסק בהקמה
              </h2>
              <div className="flex items-start gap-3 text-right bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-gray-700 text-lg mb-4">
                    מערכת ההזמנות עדיין לא זמינה. על בעל העסק להשלים את ההגדרות הבאות:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    {!hasServices && (
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span>הוספת שירותים</span>
                      </li>
                    )}
                    {!hasStaff && (
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span>הוספת עובדים/ספקי שירות</span>
                      </li>
                    )}
                    {!hasBranches && (
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span>הוספת סניף/מיקום</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              <div className="text-gray-600">
                <p className="mb-2">
                  אם אתה בעל העסק, אנא השלם את ההגדרות בדשבורד.
                </p>
                <p className="text-sm">
                  לקוחות - אנא פנו ישירות לעסק לקביעת תור.
                </p>
              </div>
            </div>
            
            {/* Contact Info */}
            {(business.phone || business.email) && (
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">פרטי התקשרות:</h3>
                <div className="flex flex-col gap-2 text-gray-600">
                  {business.phone && (
                    <a 
                      href={`tel:${business.phone}`}
                      className="hover:text-primary-600 transition-colors"
                    >
                      📞 {business.phone}
                    </a>
                  )}
                  {business.email && (
                    <a 
                      href={`mailto:${business.email}`}
                      className="hover:text-primary-600 transition-colors"
                    >
                      ✉️ {business.email}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <BusinessInfoPage
            business={business}
            branches={business.branches}
            services={business.services}
            staff={business.staff}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4 mt-12 text-center">
        <p className="text-sm text-gray-600">
          מופעל על ידי <span className="font-semibold text-indigo-600">Clickinder</span>
        </p>
      </footer>
    </div>
  );
}

