'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FiBell, FiSearch } from 'react-icons/fi';
import { PiSun, PiClockCounterClockwise, PiSidebar } from 'react-icons/pi';
import { useTranslations } from 'next-intl';

export function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const t = useTranslations('Sidebar');
  const [search, setSearch] = useState('');
  const pathname = usePathname();

  const titles: Record<string, string> = {
    '/forecast': 'Forecast',
  };

  const currentTitle = titles[pathname] || 'Dashboard';

  return (
    <header className="h-14 bg-card px-6 flex items-center justify-between shadow-sm z-30">
      <div className="flex items-center gap-6">
        <PiSidebar
          size={24}
          className="text-white cursor-pointer hover:text-gray-300"
          onClick={onToggleSidebar}
        />

        <div className="flex items-center gap-1 text-white/70 font-medium">
          <span>{t('pages')}/</span>
          <span className="text-white">{currentTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-40 pl-9 pr-3 py-1 rounded-full bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
          />
        </div>

        {[PiSun, PiClockCounterClockwise, FiBell].map((Icon, i) => (
          <Icon
            key={i}
            size={20}
            className="text-white cursor-pointer hover:text-gray-300"
          />
        ))}
      </div>
    </header>
  );
}
