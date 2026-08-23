import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Indavent CRM',
  description: 'Professional CRM system for lead management and sales performance.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Indavent CRM',
  },
  icons: {
    apple: '/logo.png',
  },
};

import { AuthGuard } from '@/components/AuthGuard';
import { MobileMenuProvider } from '@/context/MobileMenuContext';
import NotificationManager from '@/components/NotificationManager';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased bg-slate-950 text-slate-100" suppressHydrationWarning>
        <AuthGuard>
          {/* <NotificationManager /> */}
          <MobileMenuProvider>
            {children}
          </MobileMenuProvider>
        </AuthGuard>
      </body>
    </html>
  );
}
