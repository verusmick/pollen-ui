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

function scaleFactor(
  ratio: number,
  factorPercentageScale: CorrectionFactorPercentageScale
): number {
  if (factorPercentageScale === 'percentage') {
    return ratio * 100;
  }

  return ratio;
}

export function buildCorrectionFactorDerivedRows(
  values: CorrectionFactorFormValues,
  factorPercentageScale: CorrectionFactorPercentageScale
): CorrectionFactorFormDerivedRow[] {
  const detectedEvents = values.detectedEvents ?? 0;

  return values.rows.map((row) => {
    const reviewedEventsNumber = toNonNegativeNumber(row.reviewedEvents);
    const ratio =
      detectedEvents > 0 ? reviewedEventsNumber / detectedEvents : 0;

    return {
      clientId: row.clientId,
      pollen: row.pollen,
      reviewedEventsNumber,
      multiplier: scaleFactor(ratio, factorPercentageScale),
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
  const totalReviewedEvents = rows.reduce(
    (sum, row) => sum + row.reviewedEventsNumber,
    0
  );
  const remainingEvents = detectedEvents - totalReviewedEvents;
  const pollenCounts = new Map<string, number>();
  let unknownCount = 0;

  for (const row of values.rows) {
    if (!row.pollen) {
      continue;
    }

    if (row.pollen === UNKNOWN_POLLEN_CODE) {
      unknownCount += 1;
    }

    pollenCounts.set(row.pollen, (pollenCounts.get(row.pollen) ?? 0) + 1);
  }

  const multipliersByRowId = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.clientId] = row.multiplier;
    return acc;
  }, {});

  return {
    rows,
    totalReviewedEvents,
    remainingEvents,
    isBalanced: detectedEvents > 0 && remainingEvents === 0,
    hasDuplicatePollens: Array.from(pollenCounts.values()).some(
      (count) => count > 1
    ),
    unknownCount,
    multipliersByRowId,
  };
}
