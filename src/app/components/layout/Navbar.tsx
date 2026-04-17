'use client';

import { useState } from 'react';
import { FiBell, FiSearch } from 'react-icons/fi';
import { PiSun, PiClockCounterClockwise, PiSidebar } from 'react-icons/pi';

type NavAction = {
  icon: React.ElementType;
  onClick: () => void;
};

export function Navbar() {
  const [search, setSearch] = useState('');

  const actions: NavAction[] = [
    { icon: PiSun, onClick: () => console.log('theme') },
    { icon: PiClockCounterClockwise, onClick: () => console.log('reload') },
    { icon: FiBell, onClick: () => console.log('Notificaciones') },
    { icon: PiSidebar, onClick: () => console.log('Sidebar') },
  ];

  return (
    <header className="h-14 bg-card px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-6">
        <PiSidebar
          size={24}
          className="text-white cursor-pointer hover:text-gray-300"
          onClick={() => console.log('Sidebar toggle')}
        />
        <div className="flex items-center gap-1 text-white/70 font-medium">
          <span>Pages /</span>
          <span className="text-white">Forecast</span>
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
        {actions.map(({ icon: Icon, onClick }, i) => (
          <Icon
            key={i}
            size={20}
            onClick={onClick}
            className="text-white cursor-pointer hover:text-gray-300"
          />
        ))}
      </div>
    </header>
  );
}
