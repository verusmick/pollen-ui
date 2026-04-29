'use client';

import { useTranslations } from 'next-intl';

import type {
  CorrectionFactorFormDerivedState,
  CorrectionFactorFormErrors,
  CorrectionFactorMultiplierMode,
  CorrectionFactorFormValues,
} from '../../types';
import { CorrectionFactorTotals } from './CorrectionFactorTotals';

interface CorrectionFactorReviewSummaryProps {
  detectedEvents: number | null;
  hasSelectedSlice: boolean;
  selectedSliceLabel?: string | null;
  statusText?: string | null;
  errorMessage?: string | null;
  onOpenReviewWorkspace: () => void;
}

interface CorrectionFactorResultSummaryProps {
  values: CorrectionFactorFormValues;
  detectedEvents: number | null;
  derived: CorrectionFactorFormDerivedState;
  errors: CorrectionFactorFormErrors;
  validationErrors: CorrectionFactorFormErrors;
  basePollen: string;
  correctionMultiplier: number;
  showStoredMultiplierView: boolean;
  onMultiplierModeChange: (mode: CorrectionFactorMultiplierMode) => void;
  onManualMultiplierChange: (value: string) => void;
}

interface ReviewMetricProps {
  label: string;
  value: string;
  variant?: 'default' | 'highlight';
}

function ReviewMetric({ label, value, variant = 'default' }: ReviewMetricProps) {
  return (
    <div
      className={`min-h-[74px] rounded-md border px-3 py-2.5 text-center ${
        variant === 'highlight'
          ? 'border-sky-200 bg-sky-50'
          : 'border-border bg-background'
      }`}
    >
      <div
        className={`text-[11px] font-medium uppercase tracking-wide ${
          variant === 'highlight' ? 'text-sky-700' : 'text-muted-foreground'
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-1.5 text-lg font-bold leading-tight ${
          variant === 'highlight' ? 'text-sky-950' : 'text-foreground'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export function CorrectionFactorReviewSummary({
  detectedEvents,
  hasSelectedSlice,
  selectedSliceLabel = null,
  statusText = null,
  errorMessage = null,
  onOpenReviewWorkspace,
}: CorrectionFactorReviewSummaryProps) {
  const t = useTranslations('correctionFactorsPage.form.reviewSummary');
  const isReviewWorkspaceDisabled =
    !hasSelectedSlice || detectedEvents === null || detectedEvents <= 0;
  const shouldShowStatusText = statusText && isReviewWorkspaceDisabled;

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(180px,220px)_minmax(0,1fr)_auto] lg:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground">
            3
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('description')}
            </p>
          </div>
        </div>

        <div className="rounded-md border border-border bg-background px-3 py-2">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t('selectedSlice')}
          </div>
          <div className="mt-1 text-sm font-medium text-foreground">
            {selectedSliceLabel ?? t('slicePending')}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenReviewWorkspace}
          disabled={isReviewWorkspaceDisabled}
          className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-sky-600 bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:border-sky-700 hover:bg-sky-700 disabled:cursor-not-allowed disabled:border-border disabled:bg-background disabled:text-muted-foreground disabled:opacity-50 lg:w-auto"
        >
          {t('action')}
        </button>
      </div>

      {errorMessage ? (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : shouldShowStatusText ? (
        <div className="mt-3 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
          {statusText}
        </div>
      ) : null}
    </section>
  );
}

export function CorrectionFactorResultSummary({
  values,
  detectedEvents,
  derived,
  errors,
  validationErrors,
  basePollen,
  correctionMultiplier,
  showStoredMultiplierView,
  onMultiplierModeChange,
  onManualMultiplierChange,
}: CorrectionFactorResultSummaryProps) {
  const t = useTranslations('correctionFactorsPage.form.reviewSummary');
  const distributionT = useTranslations('correctionFactorsPage.form.distribution');
  const markedAsBasePollenCount =
    derived.rows.find((row) => row.isBasePollen && !row.isSyntheticUnknown)
      ?.reviewedEventsNumber ?? 0;
  const unknownCount = derived.unknownReviewedEvents;
  const basePollenLabel = basePollen
    ? t('markedAsBasePollen', { basePollen })
    : t('markedAsBasePollenFallback');
  const manualMultiplierError =
    errors.manualMultiplier ?? validationErrors.manualMultiplier;
  const isManualMode = values.multiplierMode === 'manual';
  const showMultiplierControls =
    !showStoredMultiplierView || values.detectedEvents !== null;
  const multiplierLabel =
    isManualMode && !showStoredMultiplierView
      ? distributionT('manualCorrectionMultiplier')
      : t('correctionMultiplier');

  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-3">
      <div className="border-b border-border pb-2">
        <h2 className="text-base font-semibold text-foreground">
          {distributionT('title')}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ReviewMetric
          label={t('detectedEvents')}
          value={
            detectedEvents === null
              ? t('countPending')
              : t('count', { count: detectedEvents })
          }
        />
        <ReviewMetric
          label={basePollenLabel}
          value={t('count', { count: markedAsBasePollenCount })}
        />
        <ReviewMetric
          label={t('unknown')}
          value={t('count', { count: unknownCount })}
        />
        <ReviewMetric
          label={multiplierLabel}
          value={correctionMultiplier.toFixed(2)}
          variant="highlight"
        />
      </div>

      {showMultiplierControls ? (
        <div className="space-y-2 rounded-md border border-border bg-background p-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onMultiplierModeChange('eventBased')}
              className={`rounded-md border px-2 py-1.5 text-sm font-medium transition ${
                !isManualMode
                  ? 'border-sky-600 bg-sky-600 text-white'
                  : 'border-border bg-card text-foreground hover:bg-muted'
              }`}
            >
              {distributionT('eventBasedMode')}
            </button>
            <button
              type="button"
              onClick={() => onMultiplierModeChange('manual')}
              className={`rounded-md border px-2 py-1.5 text-sm font-medium transition ${
                isManualMode
                  ? 'border-amber-600 bg-amber-500 text-white'
                  : 'border-border bg-card text-foreground hover:bg-muted'
              }`}
            >
              {distributionT('manualMode')}
            </button>
          </div>

          {isManualMode ? (
            <label className="block text-sm">
              <span className="text-muted-foreground">
                {distributionT('manualMultiplierLabel')}
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
                {distributionT('manualMultiplierHelp')}
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
                {distributionT('useEventBasedMultiplier')}
              </button>
            </label>
          ) : (
            <p className="text-xs leading-5 text-muted-foreground">
              {distributionT('eventBasedModeHelp')}
            </p>
          )}
        </div>
      ) : null}

      {!showStoredMultiplierView ? (
        <CorrectionFactorTotals
          derived={derived}
          tableError={errors.rows ?? validationErrors.rows}
        />
      ) : null}

      {showStoredMultiplierView ? (
        <p className="text-sm text-muted-foreground">
          {distributionT('restoredMultiplierGuidance')}
        </p>
      ) : null}
    </section>
  );
}
