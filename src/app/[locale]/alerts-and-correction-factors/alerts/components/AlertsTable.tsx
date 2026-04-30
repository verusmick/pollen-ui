'use client';

import { useTranslations } from 'next-intl';

import type { AlertRecord } from '@/app/[locale]/rules-and-notifications/types';
import { AlertsTableRow } from './AlertsTableRow';

interface AlertsTableProps {
  rows: AlertRecord[];
  ruleNamesById?: Record<string, string>;
  deletingId?: string | null;
  onDelete: (id: string) => void;
}

export function AlertsTable({
  rows,
  ruleNamesById = {},
  deletingId = null,
  onDelete,
}: AlertsTableProps) {
  const t = useTranslations('alertsAndCorrectionFactorsPage.alerts.list.table');

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-background">
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('rule')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('type')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('minValue')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('maxValue')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <AlertsTableRow
                key={row.id}
                record={row}
                ruleNamesById={ruleNamesById}
                deleting={deletingId === row.id}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
