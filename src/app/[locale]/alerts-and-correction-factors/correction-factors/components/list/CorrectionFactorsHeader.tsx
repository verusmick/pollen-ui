'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function CorrectionFactorsHeader() {
  const t = useTranslations('correctionFactorsPage.list');

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </div>

      <Link
        href="/alerts-and-correction-factors/correction-factors/new"
        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        {t('newButton')}
      </Link>
    </div>
  );
}
