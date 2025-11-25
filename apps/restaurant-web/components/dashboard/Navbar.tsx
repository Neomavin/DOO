'use client';

import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import authService from '@/services/auth.service';
import { useMemo } from 'react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const user = useMemo(() => authService.getCurrentUser(), []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-brand-navy bg-[#0d172c] px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar}>
          <Menu size={18} />
        </Button>
        <div>
          <p className="text-xs uppercase text-brand-gray">Bienvenido</p>
          <p className="text-sm font-semibold text-brand-white">{user?.name ?? 'Chef'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Bell size={18} />
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent text-brand-black">
          {user?.name?.slice(0, 2).toUpperCase() ?? 'DO'}
        </div>
      </div>
    </header>
  );
}
