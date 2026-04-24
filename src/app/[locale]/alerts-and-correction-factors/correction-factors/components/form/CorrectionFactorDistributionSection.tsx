'use client';

import { useTranslations } from 'next-intl';

import type {
  CorrectionFactorFormDerivedState,
  CorrectionFactorFormErrors,
  CorrectionFactorFormValues,
} from '../../types';
import { CorrectionFactorDistributionTable } from './CorrectionFactorDistributionTable';
import { CorrectionFactorTotals } from './CorrectionFactorTotals';

interface CorrectionFactorDistributionSectionProps {
  values: CorrectionFactorFormValues;
  derived: CorrectionFactorFormDerivedState;
  errors: CorrectionFactorFormErrors;
  validationErrors: CorrectionFactorFormErrors;
  canAddRow: boolean;
  showStoredMultiplierView: boolean;
  isEventReviewMode: boolean;
  getPollenOptions: (currentRowPollen: string) => string[];
  onAddRow: () => void;
  onPollenChange: (clientId: string, pollen: string) => void;
  onReviewedEventsChange: (clientId: string, reviewedEvents: string) => void;
  onRemoveRow: (clientId: string) => void;
}

export function CorrectionFactorDistributionSection({
  values,
  derived,
  errors,
  validationErrors,
  canAddRow,
  showStoredMultiplierView,
  isEventReviewMode,
  getPollenOptions,
  onAddRow,
  onPollenChange,
  onReviewedEventsChange,
  onRemoveRow,
}: CorrectionFactorDistributionSectionProps) {
  const t = useTranslations('correctionFactorsPage.form.distribution');

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
          {isEventReviewMode ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {t('derivedFromEvents')}
            </p>
          ) : null}
          {showStoredMultiplierView ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {t('restoredMultiplierGuidance')}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onAddRow}
          disabled={!canAddRow}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t('addRow')}
        </button>
      </div>
      <CorrectionFactorDistributionTable
        rows={values.rows}
        derived={derived}
        errors={errors}
        validationErrors={validationErrors}
        isEventReviewMode={isEventReviewMode}
        showStoredMultiplierView={showStoredMultiplierView}
        getPollenOptions={getPollenOptions}
        onPollenChange={onPollenChange}
        onReviewedEventsChange={onReviewedEventsChange}
        onRemove={onRemoveRow}
      />

      {!showStoredMultiplierView ? (
        <CorrectionFactorTotals
          derived={derived}
          tableError={errors.rows ?? validationErrors.rows}
        />
      ) : null}
    </section>
  );
}
