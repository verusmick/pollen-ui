'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/features/i18n/routing';

import type { AlertRecord } from '@/app/[locale]/rules-and-notifications/types';

interface AlertsTableRowProps {
  record: AlertRecord;
  ruleNamesById?: Record<string, string>;
  deleting?: boolean;
  onDelete: (id: string) => void;
}

function formatNumber(value: number | null): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

export function AlertsTableRow({
  record,
  ruleNamesById = {},
  deleting = false,
  onDelete,
}: AlertsTableRowProps) {
  const t = useTranslations('alertsAndCorrectionFactorsPage.alerts.list.table');
  const sharedT = useTranslations('messageSystemPage.shared');
  const ruleLabel =
    record.ruleId === null
      ? sharedT('notAvailable')
      : ruleNamesById[String(record.ruleId)] ?? String(record.ruleId);

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 text-sm text-foreground">{ruleLabel}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {record.type || sharedT('notAvailable')}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatNumber(record.minValue) || sharedT('notAvailable')}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatNumber(record.maxValue) || sharedT('notAvailable')}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/alerts-and-correction-factors/alerts/${record.id}/edit`}
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
