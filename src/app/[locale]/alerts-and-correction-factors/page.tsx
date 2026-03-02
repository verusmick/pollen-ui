// 'use client';

// import { useThemeStore } from '@/store';
// import { useEffect } from 'react';
import { AlertsList, FiltersBar, Tabs } from './components';
import { redirect } from 'next/navigation';
// import { useTranslations } from 'next-intl';
// import { useRouter, usePathname } from 'next/navigation';

export default function AlertsAndCorrectionFactorsPage() {
  // const setTheme = useThemeStore((s) => s.setTheme);
  // const t = useTranslations('nowCastingPage');
  // const pathname = usePathname();
  // const router = useRouter();

  // const switchLocale = (nextLocale: string) => {
  //   const segments = pathname.split('/');
  //   segments[1] = nextLocale;
  //   router.push(segments.join('/'));
  // };

  // useEffect(() => {
  //   setTheme('light');
  //   return () => {
  //     setTheme('dark');
  //   };
  // }, []);
  return redirect('/alerts-and-correction-factors/correction-factors');

  return (
    <main>
      {/* <div style={{ marginTop: 12 }}>
        <button onClick={() => switchLocale('en')}>EN</button>
        <button onClick={() => switchLocale('es')}>ES</button>
        <button onClick={() => switchLocale('fr')}>FR</button>
      </div>

      <h2>{t('message_loading')}</h2> */}

      <div className="flex flex-col h-full bg-background text-foreground">
        <Tabs />
        <div className="p-4 space-y-4 overflow-hidden">
          <FiltersBar />
          <AlertsList />
        </div>
      </div>
    </main>
  );
}
