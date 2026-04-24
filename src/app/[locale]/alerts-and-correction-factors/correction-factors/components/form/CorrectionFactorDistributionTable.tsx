'use client';

import { useTranslations } from 'next-intl';

import type {
  CorrectionFactorFormDerivedState,
  CorrectionFactorFormErrors,
  CorrectionFactorDistributionRowForm,
} from '../../types';
import { CorrectionFactorDistributionRow } from './CorrectionFactorDistributionRow';

interface CorrectionFactorDistributionTableProps {
  rows: CorrectionFactorDistributionRowForm[];
  derived: CorrectionFactorFormDerivedState;
  errors: CorrectionFactorFormErrors;
  validationErrors: CorrectionFactorFormErrors;
  isEventReviewMode: boolean;
  showStoredMultiplierView: boolean;
  getPollenOptions: (currentRowPollen: string) => string[];
  onPollenChange: (clientId: string, pollen: string) => void;
  onReviewedEventsChange: (clientId: string, reviewedEvents: string) => void;
  onRemove: (clientId: string) => void;
}

export function CorrectionFactorDistributionTable({
  rows,
  derived,
  errors,
  validationErrors,
  isEventReviewMode,
  showStoredMultiplierView,
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
            {rows.map((row) => {
              const multiplier = showStoredMultiplierView
                ? row.storedMultiplier ?? 0
                : derived.multipliersByRowId[row.clientId] ?? 0;

              return (
                <CorrectionFactorDistributionRow
                  key={row.clientId}
                  clientId={row.clientId}
                  pollen={row.pollen}
                  reviewedEvents={row.reviewedEvents}
                  multiplier={multiplier}
                  pollenOptions={getPollenOptions(row.pollen)}
                  isBasePollen={row.isBasePollen}
                  isReadOnly={isEventReviewMode || showStoredMultiplierView}
                  showStoredMultiplierView={showStoredMultiplierView}
                  errors={
                    errors.rowErrorsById[row.clientId] ??
                    validationErrors.rowErrorsById[row.clientId]
                  }
                  onPollenChange={onPollenChange}
                  onReviewedEventsChange={onReviewedEventsChange}
                  onRemove={onRemove}
                />
              );
            })}
            {!showStoredMultiplierView
              ? derived.rows
              .filter((row) => row.isSyntheticUnknown)
              .map((row) => (
                <CorrectionFactorDistributionRow
                  key={row.clientId}
                  clientId={row.clientId}
                  pollen={row.pollen}
                  reviewedEvents={String(row.reviewedEventsNumber)}
                  multiplier={row.multiplier}
                  pollenOptions={[]}
                  isBasePollen={false}
                  isSyntheticUnknown
                  isReadOnly
                  onPollenChange={onPollenChange}
                  onReviewedEventsChange={onReviewedEventsChange}
                  onRemove={onRemove}
                />
              ))
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
