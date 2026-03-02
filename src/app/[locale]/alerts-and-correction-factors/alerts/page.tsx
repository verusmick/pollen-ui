'use client';
import { useTranslations } from 'next-intl';
import { FiltersBar, AlertsList } from '../components';

export default function AlertsPage() {
  const t = useTranslations('alertsPage');
  return (
    <main>
      {/* <div style={{ marginTop: 12 }}>
        <button onClick={() => switchLocale('en')}>EN</button>
        <button onClick={() => switchLocale('es')}>ES</button>
        <button onClick={() => switchLocale('fr')}>FR</button>
      </div>

      <h2>{t('message_loading')}</h2> */}

      <div className="flex flex-col h-full bg-background text-foreground">
        <div className="p-4 space-y-4 overflow-hidden">
          <FiltersBar />
          <AlertsList />
        </div>
      </div>
    </main>
  );
}
