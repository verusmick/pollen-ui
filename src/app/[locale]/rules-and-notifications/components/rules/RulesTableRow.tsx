'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/features/i18n/routing';

import type { RuleRecord } from '../../types';

interface RulesTableRowProps {
  record: RuleRecord;
  notificationNamesById?: Record<string, string>;
  deleting?: boolean;
  onDelete: (id: string) => void;
}

function formatList(values: number[], namesById?: Record<string, string>): string {
  if (values.length === 0) {
    return '';
  }

  return values
    .map((value) => namesById?.[String(value)] ?? String(value))
    .join(', ');
}

export function RulesTableRow({
  record,
  notificationNamesById = {},
  deleting = false,
  onDelete,
}: RulesTableRowProps) {
  const t = useTranslations('messageSystemPage.rules.list.table');
  const sharedT = useTranslations('messageSystemPage.shared');
  const locationIds =
    formatList(record.locationIds) || sharedT('notAvailable');
  const notificationIds =
    formatList(record.notificationIds, notificationNamesById) ||
    sharedT('notAvailable');

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 text-sm text-foreground">{record.name}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.measureId ?? sharedT('notAvailable')}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.startDate || sharedT('notAvailable')}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.endDate || sharedT('notAvailable')}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {locationIds}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {notificationIds}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.enabled ? t('enabled') : t('disabled')}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/rules-and-notifications/rules/${record.id}/edit`}
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
