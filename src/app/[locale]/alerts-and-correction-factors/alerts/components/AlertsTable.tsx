'use client';

import { useTranslations } from 'next-intl';

import type { NotificationMessageRecord } from '@/app/[locale]/rules-and-notifications/types';

import { AlertsTableRow } from './AlertsTableRow';

interface AlertsTableProps {
  rows: NotificationMessageRecord[];
}

export function AlertsTable({ rows }: AlertsTableProps) {
  const t = useTranslations('alertsAndCorrectionFactorsPage.alerts.list.table');

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-background">
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('status')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('creationDate')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('pollen')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('location')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('value')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('notification')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('rule')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('alert')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <AlertsTableRow key={row.id} record={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
