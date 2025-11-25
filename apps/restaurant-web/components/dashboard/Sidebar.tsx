'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, UtensilsCrossed, Settings, ClipboardList, BarChart3, ShoppingBag, LogOut } from 'lucide-react';
import authService from '@/services/auth.service';

const links = [
  { href: '/(dashboard)', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/(dashboard)/menu', label: 'Menú', icon: UtensilsCrossed },
  { href: '/(dashboard)/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/(dashboard)/orders/history', label: 'Historial', icon: ClipboardList },
  { href: '/(dashboard)/reports', label: 'Reportes', icon: BarChart3 },
  { href: '/(dashboard)/settings', label: 'Configuración', icon: Settings }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-brand-navy bg-brand-black/70 p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-brand-white">Delivery Ocotepeque</h1>
        <p className="text-xs text-brand-gray">Panel de restaurante</p>
      </div>
      <nav className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={cn('flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium', active ? 'bg-brand-navy text-brand-white' : 'text-brand-gray hover:bg-brand-navy/40')}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => {
          authService.logout();
          window.location.href = '/(auth)/login';
        }}
        className="mt-auto flex items-center gap-2 rounded-xl border border-brand-navy px-3 py-2 text-sm text-brand-gray hover:bg-brand-navy/40"
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </aside>
  );
}
