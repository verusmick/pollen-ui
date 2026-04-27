'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import {
  CartesianGrid,
  type DotItemDotProps,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslations } from 'next-intl';

import type {
  CorrectionFactorChartRange,
  CorrectionFactorChartResolution,
  CorrectionFactorPreviewPoint,
  CorrectionFactorPreviewSeries,
  CorrectionFactorPreviewStatus,
} from '../../types';
import { formatCorrectionFactorChartRange } from '../../utils';

interface CorrectionFactorChartPreviewProps {
  basePollen: string;
  status: CorrectionFactorPreviewStatus;
  series: CorrectionFactorPreviewSeries | null;
  selectedSliceId: string | null;
  visibleRange: CorrectionFactorChartRange | null;
  resolution: CorrectionFactorChartResolution | null;
  canDrillUp: boolean;
  errorMessage?: string | null;
  onActivateBucket: (bucketId: string) => void;
  onDrillUp: () => void;
}

function formatValue(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

function buildMeasurementAxisTicks(
  series: CorrectionFactorPreviewSeries | null,
  resolution: CorrectionFactorChartResolution | null
): number[] | undefined {
  if (resolution !== 'measurement' || !series || series.points.length === 0) {
    return undefined;
  }

  const maxTicks = 18;
  const step = Math.max(1, Math.ceil(series.points.length / maxTicks));
  const ticks = series.points
    .filter((_, index) => index % step === 0)
    .map((point) => point.displayTimestamp);
  const lastTick = series.points[series.points.length - 1]?.displayTimestamp;

  if (typeof lastTick === 'number' && ticks[ticks.length - 1] !== lastTick) {
    ticks.push(lastTick);
  }

  return ticks;
}

function formatMeasurementAxisTick(
  value: number,
  series: CorrectionFactorPreviewSeries | null
): string {
  if (!series || series.points.length === 0) {
    return '';
  }

  const nearestPoint = series.points.reduce((currentNearest, point) =>
    Math.abs(point.displayTimestamp - value) <
    Math.abs(currentNearest.displayTimestamp - value)
      ? point
      : currentNearest
  );

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(nearestPoint.displayTimestamp * 1000));
}

function formatResolutionLabel(
  resolution: CorrectionFactorChartResolution | null,
  t: (key: string) => string
): string {
  switch (resolution) {
    case 'month':
      return t('resolution.month');
    case 'week':
      return t('resolution.week');
    case 'day':
      return t('resolution.day');
    case 'measurement':
      return t('resolution.measurement');
    default:
      return t('resolution.pending');
  }
}

function isFiniteCoordinate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function CorrectionFactorChartPreview({
  basePollen,
  status,
  series,
  selectedSliceId,
  visibleRange,
  resolution,
  canDrillUp,
  errorMessage = null,
  onActivateBucket,
  onDrillUp,
}: CorrectionFactorChartPreviewProps) {
  const t = useTranslations('correctionFactorsPage.form.preview');
  const bucketButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const visibleRangeLabel = formatCorrectionFactorChartRange(visibleRange);
  const showBucketButtons =
    series?.resolution === 'day' || series?.resolution === 'measurement';
  const xAxisMinTickGap =
    resolution === 'measurement' ? 6 : resolution === 'day' ? 24 : 24;
  const xAxisInterval =
    resolution === 'measurement' ? 0 : 'preserveStartEnd';
  const xAxisDataKey = resolution === 'measurement' ? 'displayTimestamp' : 'axisLabel';
  const xAxisTicks = useMemo(
    () => buildMeasurementAxisTicks(series, resolution),
    [resolution, series]
  );

  useEffect(() => {
    if (!selectedSliceId || !showBucketButtons) {
      return;
    }

    const selectedButton = bucketButtonRefs.current[selectedSliceId];

    if (!selectedButton) {
      return;
    }

    selectedButton.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [selectedSliceId, showBucketButtons, series?.points]);

  function handleBucketButtonClick(
    event: MouseEvent<HTMLButtonElement>,
    bucketId: string
  ) {
    event.preventDefault();
    onActivateBucket(bucketId);
  }

  function handleBucketKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    bucketId: string
  ) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onActivateBucket(bucketId);
  }

  function handleChartClick(state: unknown) {
    if (!state || typeof state !== 'object' || !('activePayload' in state)) {
      return;
    }

    const activePayload = state.activePayload;

    if (!Array.isArray(activePayload)) {
      return;
    }

    const bucketId = activePayload[0]?.payload?.id;

    if (typeof bucketId !== 'string' || bucketId.length === 0) {
      return;
    }

    onActivateBucket(bucketId);
  }

  function handleDotKeyDown(
    event: KeyboardEvent<SVGCircleElement>,
    bucketId: string
  ) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onActivateBucket(bucketId);
  }

  function handleDotMouseDown(event: MouseEvent<SVGCircleElement>) {
    // Prevent mouse clicks from leaving the browser's default focus outline
    // on the SVG element, while still allowing keyboard focus/navigation.
    event.preventDefault();
  }

  function renderPeakDot(props: DotItemDotProps) {
    const { cx, cy, payload } = props;
    const bucketId =
      payload && typeof payload === 'object' && 'id' in payload
        ? payload.id
        : null;

    if (
      !isFiniteCoordinate(cx) ||
      !isFiniteCoordinate(cy) ||
      typeof bucketId !== 'string'
    ) {
      return null;
    }

    const isSelected = bucketId === selectedSliceId;
    const isReviewSlice =
      payload && typeof payload === 'object' && 'isReviewSlice' in payload
        ? payload.isReviewSlice === true
        : false;

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={10}
          fill="#000000"
          fillOpacity={0.001}
          pointerEvents="all"
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label={
            isReviewSlice
              ? t('bucketSelection.reviewAction')
              : t('bucketSelection.drillDownAction')
          }
          onMouseDown={handleDotMouseDown}
          onClick={() => onActivateBucket(bucketId)}
          onKeyDown={(event) => handleDotKeyDown(event, bucketId)}
        />
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 5 : 4}
          fill={isSelected ? '#111827' : '#2563eb'}
          stroke="#ffffff"
          strokeWidth={isSelected ? 2 : 1.5}
          className="cursor-pointer"
          onMouseDown={handleDotMouseDown}
          onClick={() => onActivateBucket(bucketId)}
        />
        {isSelected && isReviewSlice ? (
          <foreignObject
            x={Math.min(Math.max(cx - 90, 8), 540)}
            y={Math.max(cy - 118, 8)}
            width={180}
            height={116}
            pointerEvents="none"
          >
            <div className="h-full w-full overflow-visible">
              {renderTooltipCard(payload, 'selected')}
            </div>
          </foreignObject>
        ) : null}
      </g>
    );
  }

  function renderTooltipCard(
    point: CorrectionFactorPreviewPoint,
    variant: 'hover' | 'selected'
  ) {
    const cardClassName =
      variant === 'selected'
        ? 'rounded-lg border border-sky-400 bg-sky-50 px-3 py-2 shadow-md'
        : 'rounded-lg border border-border bg-background px-3 py-2 shadow-md';
    const titleClassName =
      variant === 'selected'
        ? 'text-sm font-semibold text-sky-950'
        : 'text-sm font-semibold text-foreground';
    const dateClassName =
      variant === 'selected' ? 'mt-1 text-sm text-sky-900' : 'mt-1 text-sm text-foreground';
    const timeClassName =
      variant === 'selected' ? 'text-sm text-sky-700' : 'text-sm text-muted-foreground';
    const valueClassName =
      variant === 'selected'
        ? 'mt-2 text-sm font-medium text-sky-950'
        : 'mt-2 text-sm font-medium text-foreground';

    return (
      <div className={cardClassName}>
        <div className={titleClassName}>{basePollen}</div>
        <div className={dateClassName}>{point.peakDateLabel}</div>
        <div className={timeClassName}>{point.peakTimeRangeLabel}</div>
        <div className={valueClassName}>
          {t('tooltip.value', {
            value: formatValue(point.originalValue),
          })}
        </div>
      </div>
    );
  }

  function renderTooltipContent({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: ReadonlyArray<{
      payload?: CorrectionFactorPreviewPoint;
    }>;
  }) {
    const point = payload?.[0]?.payload;

    if (!active || !point) {
      return null;
    }

    return renderTooltipCard(point, 'hover');
  }

  return (
    <section className="min-w-0 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground">
            2
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('description')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {canDrillUp ? (
            <button
              type="button"
              onClick={onDrillUp}
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              {t('navigation.up')}
            </button>
          ) : null}
          <div className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            {t('range.current', {
              range: visibleRangeLabel ?? t('range.pending'),
            })}
          </div>
          <div className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            {t('resolution.current', {
              resolution: formatResolutionLabel(resolution, t),
            })}
          </div>
        </div>
      </div>

      {status === 'loading' ? (
        <div className="mt-4 flex min-h-[380px] items-center justify-center rounded-lg border border-dashed border-border bg-background px-6 text-center text-sm text-muted-foreground">
          {t('loading')}
        </div>
      ) : null}

      {status === 'idle' ? (
        <div className="mt-4 flex min-h-[380px] items-center justify-center rounded-lg border border-dashed border-border bg-background px-6 text-center text-sm text-muted-foreground">
          {t('idle')}
        </div>
      ) : null}

      {status === 'empty' ? (
        <div className="mt-4 flex min-h-[380px] items-center justify-center rounded-lg border border-dashed border-border bg-background px-6 text-center text-sm text-muted-foreground">
          {t('empty')}
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="mt-4 flex min-h-[380px] items-center justify-center rounded-lg border border-red-200 bg-red-50 px-6 text-center text-sm text-red-700">
          {errorMessage ?? t('error')}
        </div>
      ) : null}

      {status === 'ready' && series ? (
        <div className="mt-4 space-y-4">
          <div className="relative h-[380px] min-w-0 rounded-lg border border-border bg-background p-4 xl:h-[430px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series.points} onClick={handleChartClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey={xAxisDataKey}
                  type={resolution === 'measurement' ? 'number' : 'category'}
                  domain={
                    resolution === 'measurement' ? ['dataMin', 'dataMax'] : undefined
                  }
                  ticks={xAxisTicks}
                  tickFormatter={(value) =>
                    resolution === 'measurement'
                      ? formatMeasurementAxisTick(Number(value), series)
                      : String(value)
                  }
                  tickLine={false}
                  axisLine={false}
                  minTickGap={xAxisMinTickGap}
                  interval={xAxisInterval}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatValue}
                />
                <Tooltip content={renderTooltipContent} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="originalValue"
                  name={t('series.original')}
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={renderPeakDot}
                  activeDot={false}
                />
                <Line
                  type="monotone"
                  dataKey="correctedValue"
                  name={t('series.corrected')}
                  stroke="#ea580c"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {showBucketButtons ? (
            <div className="space-y-3 rounded-lg border border-border bg-background p-4">
            <div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {t('bucketSelection.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {series.resolution === 'measurement'
                    ? t('bucketSelection.reviewDescription')
                    : t('bucketSelection.drillDownDescription')}
                </p>
              </div>
            </div>

            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2 px-1">
                {series.points.map((point) => {
                  const isSelected = point.id === selectedSliceId;

                  return (
                    <button
                      key={point.id}
                      ref={(element) => {
                        bucketButtonRefs.current[point.id] = element;
                      }}
                      type="button"
                      onClick={(event) => handleBucketButtonClick(event, point.id)}
                      onKeyDown={(event) => handleBucketKeyDown(event, point.id)}
                      className={`rounded-md border px-3 py-2 text-center text-sm transition ${
                        isSelected
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-card text-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="font-medium">{point.label}</div>
                      <div
                        className={`mt-1 text-xs ${
                          isSelected ? 'text-background/80' : 'text-muted-foreground'
                        }`}
                      >
                        {t('bucketSelection.intervalValue', {
                          value: formatValue(point.originalValue),
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
