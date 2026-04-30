'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/features/i18n/routing';

import type { NotificationRecord } from '../../types';

interface NotificationsTableRowProps {
  record: NotificationRecord;
  deleting?: boolean;
  onDelete: (id: string) => void;
}

export function NotificationsTableRow({
  record,
  deleting = false,
  onDelete,
}: NotificationsTableRowProps) {
  const t = useTranslations('messageSystemPage.notifications.list.table');
  const sharedT = useTranslations('messageSystemPage.shared');
  const recipients = record.recipients.join(', ') || sharedT('notAvailable');
  const alertTypes = record.alertTypes.join(', ') || sharedT('notAvailable');

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 text-sm text-foreground">{record.name}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{recipients}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.frequency || sharedT('notAvailable')}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {alertTypes}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/rules-and-notifications/notifications/${record.id}/edit`}
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
