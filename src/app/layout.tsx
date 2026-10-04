import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pesmad App',
  description: 'Pusat sistem informasi internal Pesmad.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
