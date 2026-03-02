'use client';
import { useThemeStore } from '@/store';
import Link from 'next/link';
import { useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: ReactNode }) {
  const setTheme = useThemeStore((s) => s.setTheme);
  useEffect(() => {
    setTheme('light');
    return () => {
      setTheme('dark');
    };
  }, []);

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
    <div className="flex flex-col h-full bg-background text-foreground">
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
      <div className=" overflow-hidden">{children}</div>
    </div>
  );
}
