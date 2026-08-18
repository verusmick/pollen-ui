'use client';

import { useTranslations } from 'next-intl';

import { useNotificationMessagesList } from '@/app/[locale]/rules-and-notifications/hooks';
import { toMessageSystemUserFacingError } from '@/app/[locale]/rules-and-notifications/utils';

import { AlertsHeader } from './AlertsHeader';
import { AlertsTable } from './AlertsTable';

export function AlertsListContainer() {
  const t = useTranslations('alertsAndCorrectionFactorsPage.alerts.list.states');
  const { data = [], isLoading, isFetching, isError, error } =
    useNotificationMessagesList();

  return (
    <main className="flex min-h-full flex-col gap-4 p-4 pb-6">
      <AlertsHeader />

      {isLoading && data.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          {t('loading')}
        </div>
      ) : null}

      {!isLoading && isFetching && !isError ? (
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          {t('updating')}
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {toMessageSystemUserFacingError(error, {
            fallbackMessage: t('error'),
          })}
        </div>
      ) : null}

      {!isLoading && !isError && data.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          {t('empty')}
        </div>
      ) : null}

      {!isLoading && !isError && data.length > 0 ? (
        <AlertsTable rows={data} />
      ) : null}
    </main>
  );
}
