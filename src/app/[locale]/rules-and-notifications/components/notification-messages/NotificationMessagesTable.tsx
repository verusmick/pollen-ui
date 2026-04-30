'use client';

import { useTranslations } from 'next-intl';

import type { NotificationMessageRecord } from '../../types';
import { NotificationMessagesTableRow } from './NotificationMessagesTableRow';

interface NotificationMessagesTableProps {
  rows: NotificationMessageRecord[];
  notificationNamesById?: Record<string, string>;
  deletingId?: string | null;
  onDelete: (id: string) => void;
}

export function NotificationMessagesTable({
  rows,
  notificationNamesById = {},
  deletingId = null,
  onDelete,
}: NotificationMessagesTableProps) {
  const t = useTranslations('messageSystemPage.notificationMessages.list.table');

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-background">
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('notification')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('measureId')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('creationDate')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('value')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('description')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <NotificationMessagesTableRow
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
