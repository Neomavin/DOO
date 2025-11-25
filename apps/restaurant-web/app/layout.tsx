import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Delivery Ocotepeque | Restaurant Dashboard',
  description: 'Panel de administración para restaurantes asociados',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className + ' bg-brand-navy text-brand-gray min-h-screen'}>{children}</body>
    </html>
  );
}
