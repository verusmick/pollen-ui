'use client';

import { useState } from 'react';
import { FiCloud, FiChevronLeft, FiChevronRight, FiActivity } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Sidebar() {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const routes = [
    { label: 'Forecast', href: '/forecast', icon: FiCloud },
    { label: 'Now Casting', href: '/now-casting', icon: FiActivity },
  ];

  const sidebarWidth = collapsed ? 0 : 256;

  return (
    <div className="flex h-screen relative">
      <aside
        className={`
          bg-card text-white border-r border-white/40 flex flex-col
          ${collapsed ? 'w-0 p-0 overflow-hidden' : 'w-64 p-5'}
        `}
      >
        <div className={`flex items-center mb-8 ${collapsed ? 'hidden' : ''}`}>
          <img src="/zaum.png" alt="Logo" className="h-8 w-10 mr-3" />
          <span className="text-lg">{t('title')}</span>
        </div>

        <h2
          className={`text-sm tracking-wider text-white/60 mb-3 ${
            collapsed ? 'hidden' : ''
          }`}
        >
          {t('pages')}
        </h2>

        <nav className="flex-1">
          <ul className="space-y-2">
            {routes.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              if (collapsed) return null;

              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded cursor-pointer
                      ${isActive ? 'bg-white/10' : 'hover:bg-gray-700'}
                    `}
                  >
                    <Icon
                      size={18}
                      className={isActive ? 'text-white' : 'text-gray-300'}
                    />
                    <span className={isActive ? 'text-white' : 'text-gray-300'}>
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`
          absolute top-1/2 -translate-y-1/2
          bg-card hover:bg-card/80 p-2 rounded-full z-100
        `}
        style={{ left: sidebarWidth - 16 }}
      >
        {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
      </button>
    </div>
  );
}
