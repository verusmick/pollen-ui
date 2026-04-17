'use client';
import { ReactNode } from 'react';
import { Link, usePathname } from '@/features/i18n/routing';

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { label: 'Alerts', href: '/alerts-and-correction-factors/alerts' },
    {
      label: 'Correction Factors',
      href: '/alerts-and-correction-factors/correction-factors',
    },
  ];

  const linkClasses = (active: boolean) =>
    `px-4 py-2 text-sm font-medium ` +
    (active
      ? 'text-foreground border-b-2 border-primary hover:text-foreground'
      : 'text-muted-foreground hover:text-foreground');

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <nav className="flex border-b border-border px-4 pt-4">
        {tabs.map(({ href, label }) => {
          const active = pathname?.endsWith(href);
          return (
            <Link key={href} href={href} className={linkClasses(active)}>
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="flex min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
