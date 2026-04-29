'use client';

import { useTranslations } from 'next-intl';

import type {
  CorrectionFactorFormDerivedState,
  CorrectionFactorMultiplierMode,
} from '../../types';

interface CorrectionFactorDistributionTableProps {
  derived: CorrectionFactorFormDerivedState;
  detectedEvents: number | null;
  basePollen: string;
  showStoredMultiplierView: boolean;
  storedMultiplier?: number | null;
  multiplierMode: CorrectionFactorMultiplierMode;
}

interface SummaryMetricProps {
  label: string;
  value: string | number;
}

function SummaryMetric({ label, value }: SummaryMetricProps) {
  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function CorrectionFactorDistributionTable({
  derived,
  detectedEvents,
  basePollen,
  showStoredMultiplierView,
  storedMultiplier = null,
  multiplierMode,
}: CorrectionFactorDistributionTableProps) {
  const t = useTranslations('correctionFactorsPage.form.distribution');
  const baseRow = derived.rows.find(
    (row) => row.isBasePollen && !row.isSyntheticUnknown
  );
  const basePollenCount = baseRow?.reviewedEventsNumber ?? 0;
  const correctionMultiplier = showStoredMultiplierView
    ? (storedMultiplier ?? 0)
    : (baseRow?.multiplier ?? 0);
  const basePollenLabel = basePollen
    ? t('markedAsBasePollen', { basePollen })
    : t('markedAsBasePollenFallback');
  const multiplierLabel =
    multiplierMode === 'manual' && !showStoredMultiplierView
      ? t('manualCorrectionMultiplier')
      : t('correctionMultiplier');

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {!showStoredMultiplierView ? (
        <>
          <SummaryMetric
            label={t('detectedEvents')}
            value={detectedEvents ?? 0}
          />
          <SummaryMetric
            label={basePollenLabel}
            value={basePollenCount}
          />
          <SummaryMetric
            label={t('countedAsUnknown')}
            value={derived.unknownReviewedEvents}
          />
        </>
      ) : null}
      <SummaryMetric
        label={multiplierLabel}
        value={correctionMultiplier.toFixed(2)}
      />
    </div>
  );
}
