'use client';

import { useTranslations } from 'next-intl';

import type { CorrectionFactorRecord } from '../../types';
import { CorrectionFactorsTableRow } from './CorrectionFactorsTableRow';

interface CorrectionFactorsTableProps {
  rows: CorrectionFactorRecord[];
  locationNamesById?: Record<string, string>;
}

export function CorrectionFactorsTable({
  rows,
  locationNamesById = {},
}: CorrectionFactorsTableProps) {
  const t = useTranslations('correctionFactorsPage.list.table');

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-background">
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('id')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('location')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('basePollen')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('dateRange')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('status')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <CorrectionFactorsTableRow
                key={row.id}
                record={row}
                locationName={locationNamesById[row.location] ?? row.location}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
