import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardFooter } from '@/components/dashboard/DashboardFooter';
import { HelpModal } from '@/components/dashboard/HelpModal';
import { BusinessProvider } from '@/contexts/BusinessContext';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Get business info for logo
  const business = await prisma.business.findFirst({
    where: {
      ownerUserId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      slug: true,
    },
  });

  return (
    <BusinessProvider business={{ name: business?.name, logoUrl: business?.logoUrl, slug: business?.slug }}>
      <div className="flex min-h-screen bg-gray-50 w-full overflow-x-hidden">
        {/* Sidebar - Fixed on right */}
        <Sidebar businessName={business?.name} businessLogo={business?.logoUrl} />

        {/* Main Content Area - Takes remaining space */}
        <main className="flex-1 min-w-0 lg:mr-64 w-full flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <DashboardFooter />
        </main>

        {/* Help Modal */}
        <HelpModal />
      </div>
    </BusinessProvider>
  );
}

