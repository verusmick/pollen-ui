'use client';

import { useTranslations } from 'next-intl';

import type { RuleRecord } from '../../types';
import { RulesTableRow } from './RulesTableRow';

interface RulesTableProps {
  rows: RuleRecord[];
  notificationNamesById?: Record<string, string>;
  deletingId?: string | null;
  onDelete: (id: string) => void;
}

export function RulesTable({
  rows,
  notificationNamesById = {},
  deletingId = null,
  onDelete,
}: RulesTableProps) {
  const t = useTranslations('messageSystemPage.rules.list.table');

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-background">
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('name')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('measureId')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('startDate')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('endDate')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('locationIds')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('notificationIds')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('enabledState')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <RulesTableRow
                key={row.id}
                record={row}
                notificationNamesById={notificationNamesById}
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
