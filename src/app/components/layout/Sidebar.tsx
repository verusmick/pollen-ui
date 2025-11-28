'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { FiCloud } from 'react-icons/fi';

export function Sidebar({
  collapsed,
  isMobile = false,
}: {
  collapsed: boolean;
  isMobile?: boolean;
}) {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();

  const routes = [{ label: 'Forecast', href: '/forecast', icon: FiCloud }];

  return (
    <aside
      className={`
        bg-card text-white py-5 px-4 flex flex-col h-screen border-r border-white/40
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobile ? 'fixed z-20 top-0 left-0 h-screen shadow-md' : ''}
        ${isMobile ? (collapsed ? '-translate-x-full' : 'translate-x-0') : ''}
        ${!isMobile ? (collapsed ? 'md:w-20' : 'md:w-64') : ''}
      `}
    >
      <div className="flex items-center mb-8 px-2">
        <img src="/zaum.png" alt="Logo" className="h-8 w-10 mr-3 shrink-0" />
        <span
          className={`
            text-lg whitespace-nowrap overflow-hidden
            transition-all duration-300
            ${collapsed ? 'opacity-0 translate-x-4 md:block hidden' : 'opacity-100 translate-x-0'}
          `}
        >
          {t('title')}
        </span>
      </div>

      {!collapsed && (
        <h2 className="text-sm tracking-wider text-white/60 px-2 mb-3">
          {t('pages')}
        </h2>
      )}

      <nav className="flex-1">
        <ul className="space-y-2">
          {routes.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li
                key={href}
                className={`
                  flex items-center px-4 py-2 rounded cursor-pointer
                  transition-colors duration-300
                  ${isActive ? 'bg-white/10' : 'hover:bg-gray-700'}
                `}
              >
                <div className="w-6 flex justify-center shrink-0">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-300'} />
                </div>
                <span
                  className={`
                    whitespace-nowrap overflow-hidden ml-3 transition-all duration-300
                    ${collapsed ? 'opacity-0 translate-x-4 w-0 md:w-0' : 'opacity-100 translate-x-0 w-auto'}
                    ${isActive ? 'text-white' : 'text-gray-300'}
                  `}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
