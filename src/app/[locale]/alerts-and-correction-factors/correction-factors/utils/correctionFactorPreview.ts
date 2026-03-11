import type {
  CorrectionFactorPreviewPoint,
  CorrectionFactorPreviewSeries,
} from '../types';

export function buildCorrectionFactorPreviewSeries(
  originalValues: Array<{ label: string; value: number }>,
  basePollenMultiplier: number
): CorrectionFactorPreviewSeries {
  const points: CorrectionFactorPreviewPoint[] = originalValues.map((point) => ({
    label: point.label,
    originalValue: point.value,
    correctedValue: point.value * basePollenMultiplier,
  }));

  return { points };
}

export function hasCorrectionFactorPreviewSource(
  source: CorrectionFactorPreviewSeries | null | undefined
): source is CorrectionFactorPreviewSeries {
  return Boolean(source && source.points.length > 0);
}

// TODO: Replace the preview source adapter once backend confirms a preview endpoint or source.
