'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/features/i18n/routing';

import type { RuleRecord } from '../../types';

interface RulesTableRowProps {
  record: RuleRecord;
  locationNamesById?: Record<string, string>;
  notificationNamesById?: Record<string, string>;
  deleting?: boolean;
  onDelete: (id: string) => void;
}

function formatList(
  values: Array<number | string>,
  namesById?: Record<string, string>
): string {
  if (values.length === 0) {
    return '';
  }

  return values
    .map((value) => namesById?.[String(value)] ?? String(value))
    .join(', ');
}

export function RulesTableRow({
  record,
  locationNamesById = {},
  notificationNamesById = {},
  deleting = false,
  onDelete,
}: RulesTableRowProps) {
  const t = useTranslations('messageSystemPage.rules.list.table');
  const sharedT = useTranslations('messageSystemPage.shared');
  const locations =
    formatList(record.locations, locationNamesById) || sharedT('notAvailable');
  const notificationIds =
    formatList(record.notificationIds, notificationNamesById) ||
    sharedT('notAvailable');
  const alerts =
    record.alerts
      .map((alert) => {
        const minValue = alert.minValue ?? sharedT('notAvailable');
        const maxValue = alert.maxValue ?? sharedT('notAvailable');
        return `${alert.type}: ${minValue} - ${maxValue}`;
      })
      .join(', ') || sharedT('notAvailable');

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 text-sm text-foreground">{record.name}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.pollen || sharedT('notAvailable')}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {locations}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {notificationIds}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{alerts}</td>
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
