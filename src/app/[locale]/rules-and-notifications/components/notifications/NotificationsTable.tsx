'use client';

import { useTranslations } from 'next-intl';

import type { NotificationRecord } from '../../types';
import { NotificationsTableRow } from './NotificationsTableRow';

interface NotificationsTableProps {
  rows: NotificationRecord[];
  deletingId?: string | null;
  onDelete: (id: string) => void;
}

export function NotificationsTable({
  rows,
  deletingId = null,
  onDelete,
}: NotificationsTableProps) {
  const t = useTranslations('messageSystemPage.notifications.list.table');

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
                {t('recipients')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('frequency')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('alertTypes')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <NotificationsTableRow
                key={row.id}
                record={row}
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
