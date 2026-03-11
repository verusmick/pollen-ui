'use client';

import { useTranslations } from 'next-intl';

import type {
  CorrectionFactorFormDerivedState,
  CorrectionFactorFormErrors,
} from '../../types';
import { CorrectionFactorDistributionRow } from './CorrectionFactorDistributionRow';

interface CorrectionFactorDistributionTableProps {
  derived: CorrectionFactorFormDerivedState;
  errors: CorrectionFactorFormErrors;
  getPollenOptions: (currentRowPollen: string) => string[];
  onPollenChange: (clientId: string, pollen: string) => void;
  onReviewedEventsChange: (clientId: string, reviewedEvents: string) => void;
  onRemove: (clientId: string) => void;
}

export function CorrectionFactorDistributionTable({
  derived,
  errors,
  getPollenOptions,
  onPollenChange,
  onReviewedEventsChange,
  onRemove,
}: CorrectionFactorDistributionTableProps) {
  const t = useTranslations('correctionFactorsPage.form.distribution');

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-background">
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('table.pollen')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('table.reviewedEvents')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('table.multiplier')}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('table.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {derived.rows.map((row) => {
              return (
                <CorrectionFactorDistributionRow
                  key={row.clientId}
                  clientId={row.clientId}
                  pollen={row.pollen}
                  reviewedEvents={String(row.reviewedEventsNumber)}
                  multiplier={row.multiplier}
                  pollenOptions={row.isSyntheticUnknown ? [] : getPollenOptions(row.pollen)}
                  isBasePollen={row.isBasePollen}
                  isSyntheticUnknown={row.isSyntheticUnknown}
                  errors={errors.rowErrorsById[row.clientId]}
                  onPollenChange={onPollenChange}
                  onReviewedEventsChange={onReviewedEventsChange}
                  onRemove={onRemove}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
