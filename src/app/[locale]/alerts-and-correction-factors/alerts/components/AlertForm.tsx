'use client';

import { useLocale, useTranslations } from 'next-intl';

import {
  MESSAGE_SYSTEM_ALERT_TYPES,
  MESSAGE_SYSTEM_NOTIFICATION_MESSAGE_STATUSES,
} from '@/app/[locale]/rules-and-notifications/constants';
import type {
  MessageSystemNotificationMessageStatus,
  NotificationMessageRecord,
} from '@/app/[locale]/rules-and-notifications/types';

import { AlertMeasurementsChart } from './AlertMeasurementsChart';

interface AlertFormProps {
  record?: NotificationMessageRecord;
  status: MessageSystemNotificationMessageStatus;
  statusError?: string | null;
  saving?: boolean;
  actionError?: string | null;
  onStatusChange: (status: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function formatNumber(
  value: number | null | undefined,
  locale: string
): string {
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

export function AlertForm({
  record,
  status,
  statusError = null,
  saving = false,
  actionError = null,
  onStatusChange,
  onSubmit,
  onCancel,
}: AlertFormProps) {
  const locale = useLocale();
  const t = useTranslations('alertsAndCorrectionFactorsPage.alerts.form');
  const sharedT = useTranslations('messageSystemPage.shared');
  const optionsT = useTranslations('messageSystemPage.notifications.options');
  const unavailable = sharedT('notAvailable');
  const notificationLabel =
    getNamedValue(record?.notification) || record?.notificationId || unavailable;
  const ruleLabel = getNamedValue(record?.rule) || record?.ruleId || unavailable;
  const alertRange = getAlertRangeParts(record?.alert);
  const alertType = alertRange?.type
    ? isKnownAlertType(alertRange.type)
      ? optionsT(`alertTypes.${alertRange.type}`)
      : alertRange.type
    : unavailable;
  const triggerRange = alertRange
    ? `${alertType} · ${formatNumber(alertRange.minValue, locale) || unavailable}-${
        formatNumber(alertRange.maxValue, locale) || unavailable
      } Pollen/m³`
    : unavailable;
  const valueLabel = formatNumber(record?.value, locale);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pb-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">
          {t('editTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('editDescription')}</p>
      </header>

      {actionError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      <form
        className="rounded-lg border border-border bg-card p-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="grid gap-5">
          <dl className="grid gap-4 rounded-md border border-border bg-background p-4 md:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('details.notification')}
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {notificationLabel}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('details.rule')}
              </dt>
              <dd className="mt-1 text-sm text-foreground">{ruleLabel}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('details.alertType')}
              </dt>
              <dd className="mt-1 text-sm text-foreground">{alertType}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('details.triggerRange')}
              </dt>
              <dd className="mt-1 text-sm text-foreground">{triggerRange}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('details.pollen')}
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {record?.pollen || unavailable}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('details.location')}
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {record?.location || unavailable}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('details.value')}
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {valueLabel ? `${valueLabel} Pollen/m³` : unavailable}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('details.creationDate')}
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {record?.creationDate || unavailable}
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {t('details.description')}
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {record?.description || unavailable}
              </dd>
            </div>
          </dl>

          <AlertMeasurementsChart record={record} />

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">
              {t('fields.status')}
            </span>
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              {MESSAGE_SYSTEM_NOTIFICATION_MESSAGE_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {t(`options.status.${option}`)}
                </option>
              ))}
            </select>
            {statusError ? (
              <span className="text-sm text-red-700">{statusError}</span>
            ) : null}
          </label>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? t('actions.saving') : t('actions.update')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
