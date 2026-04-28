'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/features/i18n/routing';

import type { CorrectionFactorRecord } from '../../types';

interface CorrectionFactorsTableRowProps {
  record: CorrectionFactorRecord;
  locationName: string;
  deleting?: boolean;
  onDelete: (id: string) => void;
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = startDate.slice(0, 10);
  const end = endDate.slice(0, 10);
  return `${start} - ${end}`;
}

function formatMultiplier(value: number | undefined): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(2)
    : '—';
}

export function CorrectionFactorsTableRow({
  record,
  locationName,
  deleting = false,
  onDelete,
}: CorrectionFactorsTableRowProps) {
  const t = useTranslations('correctionFactorsPage.list.table');
  const firstDetail = record.details[0];
  const ruleStatus = firstDetail?.published === true ? t('enabled') : t('disabled');

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 text-sm text-foreground">{record.id}</td>
      <td className="px-4 py-3 text-sm text-foreground">{locationName}</td>
      <td className="px-4 py-3 text-sm text-foreground">{record.basePollen}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDateRange(record.startDate, record.endDate)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatMultiplier(firstDetail?.factorPercentage)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {ruleStatus}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/alerts-and-correction-factors/correction-factors/${record.id}/edit`}
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
