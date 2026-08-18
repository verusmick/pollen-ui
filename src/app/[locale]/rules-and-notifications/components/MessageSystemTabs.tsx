'use client';

import { Link, usePathname } from '@/features/i18n/routing';
import { useTranslations } from 'next-intl';

const TABS = [
  {
    key: 'rules',
    href: '/rules-and-notifications/rules',
  },
  {
    key: 'notifications',
    href: '/rules-and-notifications/notifications',
  },
] as const;

export function MessageSystemTabs() {
  const pathname = usePathname();
  const t = useTranslations('messageSystemPage.tabs');

  const linkClasses = (active: boolean) =>
    `px-4 py-2 text-sm font-medium ` +
    (active
      ? 'border-b-2 border-primary text-foreground hover:text-foreground'
      : 'text-muted-foreground hover:text-foreground');

  return (
    <nav className="flex border-b border-border px-4 pt-4">
      {TABS.map(({ href, key }) => {
        const active = pathname === href || pathname?.startsWith(`${href}/`);

        return (
          <Link key={href} href={href} className={linkClasses(active)}>
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
