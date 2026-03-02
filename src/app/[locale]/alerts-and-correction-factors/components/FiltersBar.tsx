import { useTranslations } from 'next-intl';

export function FiltersBar() {
  const t = useTranslations('alertsPage');

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder={t('filters.placeholderRuleName')}
        className="h-9 px-3 rounded-md border border-border bg-card text-sm"
      />

      <select className="h-9 px-3 rounded-md border border-border bg-card text-sm">
        <option>{t('filters.pollenType')}</option>
      </select>

      <select className="h-9 px-3 rounded-md border border-border bg-card text-sm">
        <option>{t('filters.station')}</option>
      </select>

      <select className="h-9 px-3 rounded-md border border-border bg-card text-sm">
        <option>{t('filters.status')}</option>
      </select>

      <button className="h-9 px-4 rounded-md bg-primary text-background text-sm font-medium">
        {t('filters.reset')}
      </button>
    </div>
  );
}
