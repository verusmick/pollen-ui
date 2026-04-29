'use client';

import { useTranslations } from 'next-intl';

import type {
  CorrectionFactorFormDerivedState,
  CorrectionFactorFormErrors,
  CorrectionFactorFormValues,
  CorrectionFactorMultiplierMode,
} from '../../types';
import { CorrectionFactorDistributionTable } from './CorrectionFactorDistributionTable';
import { CorrectionFactorTotals } from './CorrectionFactorTotals';

interface CorrectionFactorDistributionSectionProps {
  values: CorrectionFactorFormValues;
  derived: CorrectionFactorFormDerivedState;
  errors: CorrectionFactorFormErrors;
  validationErrors: CorrectionFactorFormErrors;
  showStoredMultiplierView: boolean;
  onMultiplierModeChange: (mode: CorrectionFactorMultiplierMode) => void;
  onManualMultiplierChange: (value: string) => void;
}

export function CorrectionFactorDistributionSection({
  values,
  derived,
  errors,
  validationErrors,
  showStoredMultiplierView,
  onMultiplierModeChange,
  onManualMultiplierChange,
}: CorrectionFactorDistributionSectionProps) {
  const t = useTranslations('correctionFactorsPage.form.distribution');
  const title = showStoredMultiplierView ? t('savedTitle') : t('title');
  const description = showStoredMultiplierView
    ? t('savedDescription')
    : t('description');
  const baseStoredMultiplier =
    values.rows.find((row) => row.isBasePollen)?.storedMultiplier ?? null;
  const manualMultiplierError =
    errors.manualMultiplier ?? validationErrors.manualMultiplier;
  const isManualMode = values.multiplierMode === 'manual';

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
          {showStoredMultiplierView ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {t('restoredMultiplierGuidance')}
            </p>
          ) : null}
          {isManualMode ? (
            <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {t('manualActiveNotice')}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-3 rounded-lg border border-border bg-background p-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onMultiplierModeChange('eventBased')}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
              !isManualMode
                ? 'border-sky-600 bg-sky-600 text-white'
                : 'border-border bg-card text-foreground hover:bg-muted'
            }`}
          >
            {t('eventBasedMode')}
          </button>
          <button
            type="button"
            onClick={() => onMultiplierModeChange('manual')}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
              isManualMode
                ? 'border-amber-600 bg-amber-500 text-white'
                : 'border-border bg-card text-foreground hover:bg-muted'
            }`}
          >
            {t('manualMode')}
          </button>
        </div>

        {isManualMode ? (
          <label className="block text-sm">
            <span className="text-muted-foreground">
              {t('manualMultiplierLabel')}
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.manualMultiplier}
              onChange={(event) => onManualMultiplierChange(event.target.value)}
              className={`mt-1 h-10 w-full rounded-md border bg-card px-3 text-foreground ${
                manualMultiplierError ? 'border-red-300' : 'border-border'
              }`}
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              {t('manualMultiplierHelp')}
            </span>
            {manualMultiplierError ? (
              <span className="mt-1 block text-xs text-red-600">
                {manualMultiplierError}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onMultiplierModeChange('eventBased')}
              className="mt-2 text-sm font-medium text-sky-700 hover:text-sky-900"
            >
              {t('useEventBasedMultiplier')}
            </button>
          </label>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('eventBasedModeHelp')}
          </p>
        )}
      </div>
      <CorrectionFactorDistributionTable
        derived={derived}
        detectedEvents={values.detectedEvents}
        basePollen={values.basePollen}
        showStoredMultiplierView={showStoredMultiplierView}
        storedMultiplier={baseStoredMultiplier}
        multiplierMode={values.multiplierMode}
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
