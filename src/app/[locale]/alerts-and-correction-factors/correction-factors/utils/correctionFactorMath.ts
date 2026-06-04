import type {
  CorrectionFactorFormDerivedRow,
  CorrectionFactorFormDerivedState,
  CorrectionFactorFormValues,
  CorrectionFactorPercentageScale,
} from '../types';
import { UNKNOWN_POLLEN_CODE } from '../constants';

function toNonNegativeNumber(value: string): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function toManualMultiplier(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function scaleFactor(
  ratio: number,
  factorPercentageScale: CorrectionFactorPercentageScale
): number {
  if (factorPercentageScale === 'percentage') {
    return ratio * 100;
  }

  return ratio;
}

function getRestoredEventBasedMultiplier(
  values: CorrectionFactorFormValues,
  row: CorrectionFactorFormValues['rows'][number]
): number | null {
  if (
    values.multiplierMode !== 'eventBased' ||
    values.reviewStateSource !== 'persisted'
  ) {
    return null;
  }

  return typeof row.storedMultiplier === 'number' &&
    Number.isFinite(row.storedMultiplier)
    ? row.storedMultiplier
    : null;
}

export function buildCorrectionFactorDerivedRows(
  values: CorrectionFactorFormValues,
  factorPercentageScale: CorrectionFactorPercentageScale
): CorrectionFactorFormDerivedRow[] {
  const detectedEvents = values.detectedEvents ?? 0;

  return values.rows.map((row) => {
    const reviewedEventsNumber = toNonNegativeNumber(row.reviewedEvents);
    const eventBasedRatio =
      detectedEvents > 0 ? reviewedEventsNumber / detectedEvents : 0;
    const isManualBaseMultiplier =
      values.multiplierMode === 'manual' && row.isBasePollen;
    const manualMultiplier = toManualMultiplier(values.manualMultiplier);
    const restoredEventBasedMultiplier = getRestoredEventBasedMultiplier(
      values,
      row
    );
    const multiplier =
      isManualBaseMultiplier && manualMultiplier !== null
        ? scaleFactor(manualMultiplier, factorPercentageScale)
        : restoredEventBasedMultiplier !== null
          ? restoredEventBasedMultiplier
        : scaleFactor(eventBasedRatio, factorPercentageScale);

    return {
      clientId: row.clientId,
      pollen: row.pollen,
      reviewedEventsNumber,
      multiplier,
      isBasePollen: row.isBasePollen,
      isSyntheticUnknown: false,
    };
  });
}

export function buildCorrectionFactorDerivedState(
  values: CorrectionFactorFormValues,
  factorPercentageScale: CorrectionFactorPercentageScale
): CorrectionFactorFormDerivedState {
  const rows = buildCorrectionFactorDerivedRows(
    values,
    factorPercentageScale
  );
  const detectedEvents = values.detectedEvents ?? 0;
  const assignedReviewedEvents = rows.reduce(
    (sum, row) => sum + row.reviewedEventsNumber,
    0
  );
  const remainingEvents = detectedEvents - assignedReviewedEvents;
  const unknownReviewedEvents = Math.max(remainingEvents, 0);
  const totalReviewedEvents = assignedReviewedEvents + unknownReviewedEvents;
  const hasOverAllocatedEvents = remainingEvents < 0;
  const pollenCounts = new Map<string, number>();

  for (const row of values.rows) {
    if (!row.pollen) {
      continue;
    }

    pollenCounts.set(row.pollen, (pollenCounts.get(row.pollen) ?? 0) + 1);
  }

  const displayRows =
    unknownReviewedEvents > 0
      ? [
          ...rows,
          {
            clientId: 'synthetic-unknown',
            pollen: UNKNOWN_POLLEN_CODE,
            reviewedEventsNumber: unknownReviewedEvents,
            multiplier: scaleFactor(
              detectedEvents > 0 ? unknownReviewedEvents / detectedEvents : 0,
              factorPercentageScale
            ),
            isBasePollen: false,
            isSyntheticUnknown: true,
          },
        ]
      : rows;

  const multipliersByRowId = displayRows.reduce<Record<string, number>>((acc, row) => {
    acc[row.clientId] = row.multiplier;
    return acc;
  }, {});

  return {
    rows: displayRows,
    assignedReviewedEvents,
    unknownReviewedEvents,
    totalReviewedEvents,
    remainingEvents,
    isBalanced:
      values.detectedEvents !== null &&
      detectedEvents >= 0 &&
      !hasOverAllocatedEvents &&
      unknownReviewedEvents === 0,
    hasDuplicatePollens: Array.from(pollenCounts.values()).some(
      (count) => count > 1
    ),
    hasOverAllocatedEvents,
    multipliersByRowId,
  };
}
