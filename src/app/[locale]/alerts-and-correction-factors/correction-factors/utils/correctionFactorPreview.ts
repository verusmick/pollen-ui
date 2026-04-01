import type {
  ApiMeasurementRangeRecord,
  ApiMeasurementRecord,
  ApiMeasurementsResponse,
  CorrectionFactorPreviewPoint,
  CorrectionFactorPreviewSeries,
  CorrectionFactorPreviewSourcePoint,
} from '../types';

function normalizeFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function normalizeMeasurementPoint(
  point: unknown
): CorrectionFactorPreviewSourcePoint | null {
  if (!point || typeof point !== 'object' || Array.isArray(point)) {
    return null;
  }

  const record = point as ApiMeasurementRangeRecord;
  const from = normalizeFiniteNumber(record.from);
  const to = normalizeFiniteNumber(record.to);
  const value = normalizeFiniteNumber(record.value);

  if (from === null || to === null || value === null) {
    return null;
  }

  return {
    timestamp: from,
    endTimestamp: to,
    value,
  };
}

function formatPreviewLabel(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp * 1000));
}

export function toMeasurementPreviewRange(
  startDate: string,
  endDate: string
): { from: number; to: number } | null {
  if (!startDate || !endDate) {
    return null;
  }

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T23:59:59Z`);
  const from = Math.floor(start.getTime() / 1000);
  const to = Math.floor(end.getTime() / 1000);

  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) {
    return null;
  }

  return { from, to };
}

export function normalizeMeasurementsPreviewSource(
  payload: ApiMeasurementsResponse,
  params: {
    location: string;
    pollen: string;
  }
): CorrectionFactorPreviewSourcePoint[] {
  const measurements = payload.measurements;

  if (!Array.isArray(measurements)) {
    return [];
  }

  const matchingMeasurement = measurements.find((measurement): measurement is ApiMeasurementRecord => {
    if (!measurement || typeof measurement !== 'object' || Array.isArray(measurement)) {
      return false;
    }

    const record = measurement as ApiMeasurementRecord;
    const location = normalizeString(record.location);
    const pollen = normalizeString(record.pollen ?? record.polle);

    return location === params.location && pollen === params.pollen;
  });

  if (!matchingMeasurement || !Array.isArray(matchingMeasurement.data)) {
    return [];
  }

  return matchingMeasurement.data
    .map(normalizeMeasurementPoint)
    .filter(
      (
        point: CorrectionFactorPreviewSourcePoint | null
      ): point is CorrectionFactorPreviewSourcePoint => point !== null
    )
    .sort((left, right) => left.timestamp - right.timestamp);
}

export function buildCorrectionFactorPreviewSeries(
  originalValues: CorrectionFactorPreviewSourcePoint[],
  basePollenMultiplier: number
): CorrectionFactorPreviewSeries {
  const points: CorrectionFactorPreviewPoint[] = originalValues.map((point) => ({
    timestamp: point.timestamp,
    label: formatPreviewLabel(point.timestamp),
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
