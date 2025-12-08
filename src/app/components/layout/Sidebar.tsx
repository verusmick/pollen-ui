'use client';

import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useClickOutside } from '@/app/hooks';

export function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const routes = [
    { label: 'Forecast', href: '/forecast' },
    { label: 'Now Casting', href: '/now-casting' },
  ];

  const sidebarWidth = collapsed ? 0 : 256;

  useClickOutside(sidebarRef, () => setCollapsed(true), !collapsed);
  return (
    <>
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-screen bg-card text-white border-r border-white/40 
          flex flex-col transition-all duration-300 overflow-hidden z-50
          ${collapsed ? 'w-0' : 'w-64 p-5'}
        `}
      >
        {!collapsed && (
          <>
            <div className="flex items-center mb-8">
              <img src="/zaum.png" alt="Logo" className="h-8 w-10 mr-3" />
              <span className="text-lg">{t('title')}</span>
            </div>

            <h2 className="text-sm tracking-wider text-white/60 mb-3">
              {t('maps')}
            </h2>

            <nav className="flex-1">
              <ul className="space-y-2">
                {routes.map(({ label, href }) => {
                  const isActive = pathname === href;

                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setCollapsed(true)}
                        className={`
                          flex items-center gap-3 px-4 py-2 rounded cursor-pointer
                          ${isActive ? 'bg-white/10' : 'hover:bg-gray-700'}
                        `}
                      >
                        <span
                          className={isActive ? 'text-white' : 'text-gray-300'}
                        >
                          {label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </>
        )}
      </aside>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-1/2 -translate-y-1/2 bg-card hover:bg-card/80 p-2 rounded-full z-50 transition-all duration-300 cursor-pointer"
        style={{ left: sidebarWidth - 16 }}
      >
        {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
      </button>
    </>
  );
}
