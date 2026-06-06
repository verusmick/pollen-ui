'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/features/i18n/routing';
import { MESSAGE_SYSTEM_ALERT_TYPES } from '@/app/[locale]/rules-and-notifications/constants';
import type { NotificationMessageRecord } from '@/app/[locale]/rules-and-notifications/types';

import {
  getAlertOccurrenceDate,
  getNotificationDisplayNames,
} from '../utils/alertNotificationMessages';

interface AlertsTableRowProps {
  record: NotificationMessageRecord;
}

function formatNumber(value: number | null, locale: string): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }).format(value)
    : '';
}

function getNamedValue(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return '';
  }

  const record = value as Record<string, unknown>;
  const candidate = record.name ?? record.label ?? record.type ?? record.id;

  return typeof candidate === 'string' || typeof candidate === 'number'
    ? String(candidate)
    : '';
}

function getAlertRangeParts(value: unknown): {
  type: string;
  minValue: number | null;
  maxValue: number | null;
} | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const type = typeof record.type === 'string' ? record.type : '';
  const minValue = Number(record.min_value);
  const maxValue = Number(record.max_value);

  return {
    type,
    minValue: Number.isFinite(minValue) ? minValue : null,
    maxValue: Number.isFinite(maxValue) ? maxValue : null,
  };
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

export function AlertsTableRow({ record }: AlertsTableRowProps) {
  const locale = useLocale();
  const t = useTranslations('alertsAndCorrectionFactorsPage.alerts.list.table');
  const sharedT = useTranslations('messageSystemPage.shared');
  const optionsT = useTranslations('messageSystemPage.notifications.options');
  const unavailable = sharedT('notAvailable');
  const notificationNames = getNotificationDisplayNames(record);
  const ruleLabel = getNamedValue(record.rule) || record.ruleId || unavailable;
  const alertRange = getAlertRangeParts(record.alert);
  const alertTypeLabel = alertRange
    ? isKnownAlertType(alertRange.type)
      ? optionsT(`alertTypes.${alertRange.type}`)
      : alertRange.type || unavailable
    : unavailable;
  const alertRangeLabel = alertRange
    ? `${formatNumber(alertRange.minValue, locale) || unavailable} - ${
        formatNumber(alertRange.maxValue, locale) || unavailable
      } Pollen/m³`
    : unavailable;
  const valueLabel = formatNumber(record.value, locale);

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.status || unavailable}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {getAlertOccurrenceDate(record) || unavailable}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.pollen || unavailable}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.location || unavailable}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {valueLabel ? `${valueLabel} Pollen/m³` : unavailable}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {notificationNames.length > 0 ? (
          <div className="grid gap-1">
            {notificationNames.map((name, index) => (
              <span key={`${name}-${index}`}>{name}</span>
            ))}
          </div>
        ) : (
          unavailable
        )}
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{ruleLabel}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {alertRange ? (
          <span
            className={`inline-flex w-fit items-center rounded-md border px-2 py-1 text-xs ${getAlertTypeChipClass(
              alertRange.type
            )}`}
          >
            <span className="font-medium">{alertTypeLabel}</span>
            <span className="mx-1 text-muted-foreground">·</span>
            <span>{alertRangeLabel}</span>
          </span>
        ) : (
          unavailable
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        <Link
          href={`/alerts-and-correction-factors/alerts/${record.id}/edit`}
          className="font-medium text-primary hover:underline"
        >
          {t('editStatus')}
        </Link>
      </td>
    </tr>
  );
}
