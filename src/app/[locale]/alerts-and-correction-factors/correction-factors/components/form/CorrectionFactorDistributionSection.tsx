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
  showStoredMultiplierView: boolean;
  isEventReviewMode: boolean;
}

export function CorrectionFactorDistributionSection({
  values,
  derived,
  errors,
  validationErrors,
  showStoredMultiplierView,
  isEventReviewMode,
}: CorrectionFactorDistributionSectionProps) {
  const t = useTranslations('correctionFactorsPage.form.distribution');
  const title = showStoredMultiplierView ? t('savedTitle') : t('title');
  const description = showStoredMultiplierView
    ? t('savedDescription')
    : t('description');
  const baseStoredMultiplier =
    values.rows.find((row) => row.isBasePollen)?.storedMultiplier ?? null;

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
          {!showStoredMultiplierView && isEventReviewMode ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {t('helperText')}
            </p>
          ) : null}
          {showStoredMultiplierView ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {t('restoredMultiplierGuidance')}
            </p>
          ) : null}
        </div>
      </div>
      <CorrectionFactorDistributionTable
        derived={derived}
        detectedEvents={values.detectedEvents}
        basePollen={values.basePollen}
        showStoredMultiplierView={showStoredMultiplierView}
        storedMultiplier={baseStoredMultiplier}
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
