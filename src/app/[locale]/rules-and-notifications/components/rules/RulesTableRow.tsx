'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/features/i18n/routing';

import { MESSAGE_SYSTEM_ALERT_TYPES } from '../../constants';
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

function formatNumber(value: number | null, locale: string): string {
  return value === null
    ? ''
    : new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }).format(value);
}

function isKnownAlertType(
  value: string
): value is (typeof MESSAGE_SYSTEM_ALERT_TYPES)[number] {
  return MESSAGE_SYSTEM_ALERT_TYPES.some((type) => type === value);
}

function getAlertTypeChipClass(type: string): string {
  switch (type) {
    case 'green':
      return 'border-green-500/30 bg-green-500/10 text-green-800';
    case 'yellow':
      return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-800';
    case 'red':
      return 'border-red-500/30 bg-red-500/10 text-red-800';
    default:
      return 'border-border bg-background text-foreground';
  }
}

export function RulesTableRow({
  record,
  locationNamesById = {},
  notificationNamesById = {},
  deleting = false,
  onDelete,
}: RulesTableRowProps) {
  const locale = useLocale();
  const t = useTranslations('messageSystemPage.rules.list.table');
  const sharedT = useTranslations('messageSystemPage.shared');
  const optionsT = useTranslations('messageSystemPage.notifications.options');
  const locations =
    formatList(record.locations, locationNamesById) || sharedT('notAvailable');
  const notificationIds =
    formatList(record.notificationIds, notificationNamesById) ||
    sharedT('notAvailable');

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
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.alerts.length > 0 ? (
          <div className="grid gap-1">
            {record.alerts.map((alert, index) => {
              const minValue =
                formatNumber(alert.minValue, locale) || sharedT('notAvailable');
              const maxValue =
                formatNumber(alert.maxValue, locale) || sharedT('notAvailable');

              return (
                <div
                  key={alert.id ?? `${alert.type}-${index}`}
                  className={`inline-flex w-fit items-center rounded-md border px-2 py-1 text-xs ${getAlertTypeChipClass(
                    alert.type
                  )}`}
                >
                  <span className="font-medium">
                    {isKnownAlertType(alert.type)
                      ? optionsT(`alertTypes.${alert.type}`)
                      : alert.type || sharedT('notAvailable')}
                  </span>
                  <span className="mx-1 text-muted-foreground">·</span>
                  <span>
                    {minValue}-{maxValue} Pollen/m³
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          sharedT('notAvailable')
        )}
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
