'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/features/i18n/routing';
import type { NotificationMessageRecord } from '@/app/[locale]/rules-and-notifications/types';

interface AlertsTableRowProps {
  record: NotificationMessageRecord;
}

function formatNumber(value: number | null): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
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

function getAlertLabel(value: unknown, unavailable: string): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return unavailable;
  }

  const record = value as Record<string, unknown>;
  const type = typeof record.type === 'string' ? record.type : '';
  const minValue =
    typeof record.min_value === 'number' && Number.isFinite(record.min_value)
      ? String(record.min_value)
      : '';
  const maxValue =
    typeof record.max_value === 'number' && Number.isFinite(record.max_value)
      ? String(record.max_value)
      : '';
  const range =
    minValue || maxValue
      ? `${minValue || unavailable} - ${maxValue || unavailable}`
      : '';

  return [type, range].filter(Boolean).join(' ') || unavailable;
}

export function AlertsTableRow({ record }: AlertsTableRowProps) {
  const t = useTranslations('alertsAndCorrectionFactorsPage.alerts.list.table');
  const sharedT = useTranslations('messageSystemPage.shared');
  const unavailable = sharedT('notAvailable');
  const notificationLabel =
    getNamedValue(record.notification) || record.notificationId || unavailable;
  const ruleLabel = getNamedValue(record.rule) || record.ruleId || unavailable;
  const alertLabel = getAlertLabel(record.alert, unavailable);

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.status || unavailable}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.creationDate || unavailable}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.pollen || unavailable}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.location || unavailable}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatNumber(record.value) || unavailable}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {notificationLabel}
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{ruleLabel}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{alertLabel}</td>
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
