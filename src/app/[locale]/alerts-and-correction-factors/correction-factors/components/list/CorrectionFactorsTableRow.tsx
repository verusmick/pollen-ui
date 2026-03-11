'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import type { CorrectionFactorRecord } from '../../types';
import { CorrectionFactorStatusBadge } from './CorrectionFactorStatusBadge';

interface CorrectionFactorsTableRowProps {
  record: CorrectionFactorRecord;
  locationName: string;
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = startDate.slice(0, 10);
  const end = endDate.slice(0, 10);
  return `${start} - ${end}`;
}

export function CorrectionFactorsTableRow({
  record,
  locationName,
}: CorrectionFactorsTableRowProps) {
  const t = useTranslations('correctionFactorsPage.list.table');

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 text-sm text-foreground">{record.id}</td>
      <td className="px-4 py-3 text-sm text-foreground">{locationName}</td>
      <td className="px-4 py-3 text-sm text-foreground">{record.basePollen}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDateRange(record.startDate, record.endDate)}
      </td>
      <td className="px-4 py-3 text-sm">
        <CorrectionFactorStatusBadge status={record.status} />
      </td>
      <td className="px-4 py-3 text-sm">
        <Link
          href={`/alerts-and-correction-factors/correction-factors/${record.id}/edit`}
          className="font-medium text-primary hover:underline"
        >
          {t('edit')}
        </Link>
      </td>
    </tr>
  );
}
