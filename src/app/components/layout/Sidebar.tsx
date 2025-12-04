'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { FiCloud } from 'react-icons/fi';
import Link from 'next/link';

export function Sidebar() {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();

  const routes = [
    { label: 'Forecast Map', href: '/forecast' },
    { label: 'Now Casting Map', href: '/now-casting', icon: FiCloud },
  ];

  return (
    <aside className="bg-card text-white w-64 py-5 px-4 shrink-0 z-20 flex flex-col h-screen border-r border-white/40">
      {/* Header */}
      <div className="flex items-center mb-8 px-2">
        <img src="/zaum.png" alt="Logo" className="h-8 w-10 mr-3" />
        <span className="text-lg">{t('title')}</span>
      </div>

      <h2 className="text-sm tracking-wider text-white/60 px-2 mb-3">
        {t('pages')}
      </h2>

      <nav className="flex-1">
        <ul className="space-y-2">
          {routes.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link href={href}>
                <li
                  key={href}
                  className={`
                  flex items-center gap-3 px-4 py-2 rounded cursor-pointer
                  ${isActive ? 'bg-white/10' : 'hover:bg-gray-700'}
                `}
                >
                  {Icon && (
                    <Icon
                      size={18}
                      className={isActive ? 'text-white' : 'text-gray-300'}
                    />
                  )}
                  <span className={isActive ? 'text-white' : 'text-gray-300'}>
                    {label}
                  </span>
                </li>{' '}
              </Link>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
