import type {
  ApiMeasurementRangeRecord,
  ApiMeasurementRecord,
  ApiMeasurementsResponse,
  CorrectionFactorChartRange,
  CorrectionFactorChartResolution,
  CorrectionFactorPreviewPoint,
  CorrectionFactorPreviewSeries,
  CorrectionFactorPreviewSourcePoint,
  CorrectionFactorReviewSlice,
} from '../types';
import { toCorrectionFactorUnixTimestamp } from './correctionFactorDateTime';

const SECONDS_IN_DAY = 24 * 60 * 60;

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
    displayTimestamp: from + (to - from) / 2,
    value,
  };
}

function formatUtcDate(
  timestamp: number,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(undefined, {
    ...options,
    timeZone: 'UTC',
  }).format(new Date(timestamp * 1000));
}

function formatPreviewSliceLabel(startTimestamp: number, endTimestamp: number): string {
  return `${formatUtcDate(startTimestamp, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })} - ${formatUtcDate(endTimestamp, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function formatTooltipDateLabel(timestamp: number): string {
  return formatUtcDate(timestamp, {
    day: '2-digit',
    month: '2-digit',
  }).replace(',', '');
}

function formatTimeRangeLabel(startTimestamp: number, endTimestamp: number): string {
  return `${formatUtcDate(startTimestamp, {
    hour: '2-digit',
    minute: '2-digit',
  })} - ${formatUtcDate(endTimestamp, {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function getRangeSpanInDays(range: CorrectionFactorChartRange): number {
  return Math.max(0, range.to - range.from) / SECONDS_IN_DAY;
}

function clampRange(
  range: CorrectionFactorChartRange,
  bounds: CorrectionFactorChartRange
): CorrectionFactorChartRange {
  return {
    from: Math.max(bounds.from, range.from),
    to: Math.min(bounds.to, range.to),
  };
}

function rangesEqual(
  left: CorrectionFactorChartRange | null,
  right: CorrectionFactorChartRange | null
): boolean {
  return left?.from === right?.from && left?.to === right?.to;
}

function getPreviewResolution(
  visibleRange: CorrectionFactorChartRange
): CorrectionFactorChartResolution {
  const spanInDays = getRangeSpanInDays(visibleRange);

  if (spanInDays > 120) {
    return 'month';
  }

  if (spanInDays > 42) {
    return 'week';
  }

  if (spanInDays > 2) {
    return 'day';
  }

  return 'measurement';
}

function getMonthBucketStart(timestamp: number): number {
  const date = new Date(timestamp * 1000);

  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1) / 1000;
}

function getNextMonthBucketStart(timestamp: number): number {
  const date = new Date(timestamp * 1000);

  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1) / 1000;
}

function getWeekBucketStart(timestamp: number): number {
  const date = new Date(timestamp * 1000);
  const day = date.getUTCDay();
  const dayOffset = day === 0 ? -6 : 1 - day;
  const bucketDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

  bucketDate.setUTCDate(bucketDate.getUTCDate() + dayOffset);

  return Math.floor(bucketDate.getTime() / 1000);
}

function getDayBucketStart(timestamp: number): number {
  const date = new Date(timestamp * 1000);

  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ) / 1000;
}

function getBucketRange(
  resolution: CorrectionFactorChartResolution,
  sortedPoints: CorrectionFactorPreviewSourcePoint[]
): CorrectionFactorChartRange | null {
  const firstPoint = sortedPoints[0];
  const lastPoint = sortedPoints[sortedPoints.length - 1];

  if (!firstPoint || !lastPoint) {
    return null;
  }

  if (resolution === 'month') {
    const from = getMonthBucketStart(firstPoint.timestamp);

    return {
      from,
      to: getNextMonthBucketStart(from),
    };
  }

  if (resolution === 'week') {
    const from = getWeekBucketStart(firstPoint.timestamp);

    return {
      from,
      to: from + 7 * SECONDS_IN_DAY,
    };
  }

  if (resolution === 'day') {
    const from = getDayBucketStart(firstPoint.timestamp);

    return {
      from,
      to: from + SECONDS_IN_DAY,
    };
  }

  return {
    from: firstPoint.timestamp,
    to: lastPoint.endTimestamp,
  };
}

function getBucketKey(
  point: CorrectionFactorPreviewSourcePoint,
  resolution: CorrectionFactorChartResolution
): string {
  if (resolution === 'measurement') {
    return `${point.timestamp}-${point.endTimestamp}`;
  }

  if (resolution === 'month') {
    return `month-${getMonthBucketStart(point.timestamp)}`;
  }

  if (resolution === 'week') {
    return `week-${getWeekBucketStart(point.timestamp)}`;
  }

  return `day-${getDayBucketStart(point.timestamp)}`;
}

function formatBucketLabel(
  resolution: CorrectionFactorChartResolution,
  from: number,
  to: number
): string {
  if (resolution === 'month') {
    return formatUtcDate(from, {
      month: 'short',
      year: 'numeric',
    });
  }

  if (resolution === 'week') {
    return `${formatUtcDate(from, {
      month: 'short',
      day: 'numeric',
    })} - ${formatUtcDate(to, {
      month: 'short',
      day: 'numeric',
    })}`;
  }

  if (resolution === 'day') {
    return formatUtcDate(from, {
      month: 'short',
      day: 'numeric',
    });
  }

  return formatTimeRangeLabel(from, to);
}

function formatAxisLabel(
  resolution: CorrectionFactorChartResolution,
  from: number,
  to: number
): string {
  if (resolution === 'month') {
    return formatUtcDate(from, {
      month: 'short',
    });
  }

  if (resolution === 'week' || resolution === 'day') {
    return formatUtcDate(from, {
      day: '2-digit',
      month: '2-digit',
    }).replace(',', '');
  }

  return formatUtcDate(from, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function createPreviewPoint(
  points: CorrectionFactorPreviewSourcePoint[],
  resolution: CorrectionFactorChartResolution,
  basePollenMultiplier: number
): CorrectionFactorPreviewPoint | null {
  if (points.length === 0) {
    return null;
  }

  const sortedPoints = [...points].sort((left, right) => left.timestamp - right.timestamp);
  const bucketRange = getBucketRange(resolution, sortedPoints);
  const bucketFrom = bucketRange?.from;
  const bucketTo = bucketRange?.to;

  if (
    typeof bucketFrom !== 'number' ||
    !Number.isFinite(bucketFrom) ||
    typeof bucketTo !== 'number' ||
    !Number.isFinite(bucketTo)
  ) {
    return null;
  }

  const peakPoint = sortedPoints.reduce((currentPeak, point) =>
    point.value > currentPeak.value ? point : currentPeak
  );
  const isReviewSlice = resolution === 'measurement';
  const displayedValue = isReviewSlice
    ? peakPoint.value
    : sortedPoints.reduce((sum, point) => sum + point.value, 0);
  const displayTimestamp = isReviewSlice
    ? peakPoint.displayTimestamp
    : bucketFrom + (bucketTo - bucketFrom) / 2;

  return {
    id: `${resolution}-${bucketFrom}-${bucketTo}`,
    timestamp: bucketFrom,
    endTimestamp: bucketTo,
    displayTimestamp,
    peakTimestamp: peakPoint.timestamp,
    peakEndTimestamp: peakPoint.endTimestamp,
    axisLabel: formatAxisLabel(resolution, bucketFrom, bucketTo),
    label: formatBucketLabel(resolution, bucketFrom, bucketTo),
    detailLabel: formatPreviewSliceLabel(peakPoint.timestamp, peakPoint.endTimestamp),
    peakDateLabel: formatTooltipDateLabel(peakPoint.timestamp),
    peakTimeRangeLabel: formatTimeRangeLabel(
      peakPoint.timestamp,
      peakPoint.endTimestamp
    ),
    originalValue: displayedValue,
    correctedValue: displayedValue * basePollenMultiplier,
    resolution,
    isReviewSlice,
    sourcePointsCount: sortedPoints.length,
  };
}

function filterSourcePointsByRange(
  sourcePoints: CorrectionFactorPreviewSourcePoint[],
  range: CorrectionFactorChartRange
): CorrectionFactorPreviewSourcePoint[] {
  return sourcePoints.filter(
    (point) => point.endTimestamp >= range.from && point.timestamp <= range.to
  );
}

export function toMeasurementPreviewRange(
  startDate: string,
  endDate: string
): { from: number; to: number } | null {
  const from = toCorrectionFactorUnixTimestamp(startDate);
  const to = toCorrectionFactorUnixTimestamp(endDate);

  if (from === null || to === null) {
    return null;
  }

  if (to < from) {
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

export function resolveCorrectionFactorVisibleRange(
  requestedRange: CorrectionFactorChartRange | null,
  rootRange: CorrectionFactorChartRange | null
): CorrectionFactorChartRange | null {
  if (!rootRange) {
    return null;
  }

  if (!requestedRange) {
    return rootRange;
  }

  const clampedRange = clampRange(requestedRange, rootRange);

  if (clampedRange.to < clampedRange.from) {
    return rootRange;
  }

  return clampedRange;
}

export function buildCorrectionFactorPreviewSeries(
  sourcePoints: CorrectionFactorPreviewSourcePoint[],
  visibleRange: CorrectionFactorChartRange,
  basePollenMultiplier: number
): CorrectionFactorPreviewSeries | null {
  const visibleSourcePoints = filterSourcePointsByRange(sourcePoints, visibleRange);

  if (visibleSourcePoints.length === 0) {
    return null;
  }

  const resolution = getPreviewResolution(visibleRange);

  if (resolution === 'measurement') {
    const measurementPoints = visibleSourcePoints
      .map((point) =>
        createPreviewPoint([point], resolution, basePollenMultiplier)
      )
      .filter(
        (
          point: CorrectionFactorPreviewPoint | null
        ): point is CorrectionFactorPreviewPoint => point !== null
      );

    return {
      points: measurementPoints,
      resolution,
      showPointMarkers: true,
    };
  }

  const buckets = new Map<string, CorrectionFactorPreviewSourcePoint[]>();

  for (const point of visibleSourcePoints) {
    const bucketKey = getBucketKey(point, resolution);
    const existingBucket = buckets.get(bucketKey);

    if (existingBucket) {
      existingBucket.push(point);
      continue;
    }

    buckets.set(bucketKey, [point]);
  }

  const points = Array.from(buckets.values())
    .map((bucketPoints) =>
      createPreviewPoint(bucketPoints, resolution, basePollenMultiplier)
    )
    .filter(
      (
        point: CorrectionFactorPreviewPoint | null
      ): point is CorrectionFactorPreviewPoint => point !== null
    )
    .sort((left, right) => left.timestamp - right.timestamp);

  if (points.length === 0) {
    return null;
  }

  return {
    points,
    resolution,
    showPointMarkers: false,
  };
}

export function buildCorrectionFactorReviewSlices(
  series: CorrectionFactorPreviewSeries | null
): CorrectionFactorReviewSlice[] {
  if (!series) {
    return [];
  }

  return series.points
    .filter((point) => point.isReviewSlice)
    .map((point) => ({
      id: point.id,
      from: point.timestamp,
      to: point.endTimestamp,
      peakTimestamp: point.peakTimestamp,
      label: point.detailLabel,
    }));
}

export function formatCorrectionFactorChartRange(
  range: CorrectionFactorChartRange | null
): string | null {
  if (!range) {
    return null;
  }

  return `${formatUtcDate(range.from, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} - ${formatUtcDate(range.to, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

export function hasCorrectionFactorPreviewSource(
  source: CorrectionFactorPreviewSeries | null | undefined
): source is CorrectionFactorPreviewSeries {
  return Boolean(source && source.points.length > 0);
}

export function didCorrectionFactorRangeChange(
  left: CorrectionFactorChartRange | null,
  right: CorrectionFactorChartRange | null
): boolean {
  return !rangesEqual(left, right);
}
