import type { Metadata, Viewport } from 'next';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pesmad App',
  description: 'Pusat sistem informasi internal Pesmad.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#142018',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
