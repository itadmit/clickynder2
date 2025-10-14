import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Clickinder - מערכת ניהול תורים לעסקים',
  description: 'פלטפורמת תזמון תורים מתקדמת לעסקים בישראל',
  keywords: ['תורים', 'הזמנות', 'ניהול עסק', 'קביעת תור'],
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
      </head>
      <body style={{ fontFamily: "'Noto Sans Hebrew', sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

