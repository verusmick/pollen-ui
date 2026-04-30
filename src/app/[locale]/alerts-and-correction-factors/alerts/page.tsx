import { getTranslations } from 'next-intl/server';

export default async function AlertsPage() {
  const t = await getTranslations('alertsAndCorrectionFactorsPage.alerts');

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pb-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">{t('title')}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t('description')}
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        {t('pending')}
      </section>
    </main>
  );
}
