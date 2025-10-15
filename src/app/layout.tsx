import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Clickinder - מערכת ניהול תורים לעסקים',
  description: 'פלטפורמת תזמון תורים מתקדמת לעסקים בישראל',
  keywords: ['תורים', 'הזמנות', 'ניהול עסק', 'קביעת תור'],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100;200;300;400;500;600;700;800;900&family=Assistant:wght@200;300;400;500;600;700;800&family=Heebo:wght@100;200;300;400;500;600;700;800;900&family=Rubik:wght@300;400;500;600;700;800;900&family=Varela+Round:wght@400&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

