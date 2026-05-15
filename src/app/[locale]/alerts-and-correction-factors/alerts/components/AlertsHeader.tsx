'use client';

import { useTranslations } from 'next-intl';

export function AlertsHeader() {
  const t = useTranslations('alertsAndCorrectionFactorsPage.alerts.list');

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground">{t('title')}</h1>
      <p className="text-sm text-muted-foreground">{t('description')}</p>
    </div>
  );
}
