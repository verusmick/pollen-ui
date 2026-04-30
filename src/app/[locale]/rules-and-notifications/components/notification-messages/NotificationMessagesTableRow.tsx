'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/features/i18n/routing';

import type { NotificationMessageRecord } from '../../types';

interface NotificationMessagesTableRowProps {
  record: NotificationMessageRecord;
  notificationNamesById?: Record<string, string>;
  deleting?: boolean;
  onDelete: (id: string) => void;
}

function formatNumber(value: number | null): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

export function NotificationMessagesTableRow({
  record,
  notificationNamesById = {},
  deleting = false,
  onDelete,
}: NotificationMessagesTableRowProps) {
  const t = useTranslations('messageSystemPage.notificationMessages.list.table');
  const sharedT = useTranslations('messageSystemPage.shared');
  const notificationLabel =
    record.notificationId === null
      ? sharedT('notAvailable')
      : notificationNamesById[String(record.notificationId)] ??
        String(record.notificationId);

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 text-sm text-foreground">
        {notificationLabel}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.measureId ?? sharedT('notAvailable')}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.creationDate || sharedT('notAvailable')}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatNumber(record.value) || sharedT('notAvailable')}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.description || sharedT('notAvailable')}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/rules-and-notifications/notification-messages/${record.id}/edit`}
            className="font-medium text-primary hover:underline"
          >
            {t('edit')}
          </Link>
          <button
            type="button"
            onClick={() => onDelete(record.id)}
            disabled={deleting}
            className="font-medium text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? t('deleting') : t('delete')}
          </button>
        </div>
      </td>
    </tr>
  );
}
