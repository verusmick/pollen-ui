'use client';

import { useEffect, useRef } from 'react';
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
  CorrectionFactorReviewSlice,
  CorrectionFactorPreviewSeries,
  CorrectionFactorPreviewStatus,
} from '../../types';

interface CorrectionFactorChartPreviewProps {
  status: CorrectionFactorPreviewStatus;
  series: CorrectionFactorPreviewSeries | null;
  slices: CorrectionFactorReviewSlice[];
  selectedSliceId: string | null;
  errorMessage?: string | null;
  onSelectSlice: (sliceId: string) => void;
}

function formatValue(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

function isFiniteCoordinate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function getSliceIdFromDotProps(
  props: DotItemDotProps,
  series: CorrectionFactorPreviewSeries | null
): string | null {
  const pointFromSeries =
    typeof props.index === 'number' ? series?.points[props.index] : undefined;

  if (pointFromSeries?.sliceId) {
    return pointFromSeries.sliceId;
  }

  const { payload } = props;

  if (payload && typeof payload === 'object' && 'sliceId' in payload) {
    return typeof payload.sliceId === 'string' ? payload.sliceId : null;
  }

  return null;
}

export function CorrectionFactorChartPreview({
  status,
  series,
  slices,
  selectedSliceId,
  errorMessage = null,
  onSelectSlice,
}: CorrectionFactorChartPreviewProps) {
  const t = useTranslations('correctionFactorsPage.form.preview');
  const sliceButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const selectedSlice =
    slices.find((slice) => slice.id === selectedSliceId) ?? null;

  useEffect(() => {
    if (!selectedSliceId) {
      return;
    }

    const selectedButton = sliceButtonRefs.current[selectedSliceId];

    if (!selectedButton) {
      return;
    }

    selectedButton.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [selectedSliceId, slices]);

  function handleSliceButtonClick(
    event: MouseEvent<HTMLButtonElement>,
    sliceId: string
  ) {
    event.preventDefault();
    onSelectSlice(sliceId);
  }

  function handleDotKeyDown(
    event: KeyboardEvent<SVGCircleElement>,
    sliceId: string
  ) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onSelectSlice(sliceId);
  }

  function handleDotSelect(sliceId: string) {
    onSelectSlice(sliceId);
  }

  function renderSelectableDot(props: DotItemDotProps) {
    const { cx, cy } = props;
    const sliceId = getSliceIdFromDotProps(props, series);

    if (
      !isFiniteCoordinate(cx) ||
      !isFiniteCoordinate(cy) ||
      typeof sliceId !== 'string'
    ) {
      return null;
    }

    const isSelected = sliceId === selectedSliceId;

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
          aria-label={t('sliceSelection.dotAriaLabel')}
          onClick={() => handleDotSelect(sliceId)}
          onKeyDown={(event) => handleDotKeyDown(event, sliceId)}
        />
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 5 : 3}
          fill={isSelected ? '#1f2937' : '#2563eb'}
          stroke="#ffffff"
          strokeWidth={isSelected ? 2 : 1}
          className="cursor-pointer"
          onClick={() => handleDotSelect(sliceId)}
        />
      </g>
    );
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
        <div className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          {selectedSlice
            ? t('sliceSelection.selected', {
                slice: selectedSlice.label,
              })
            : t('sliceSelection.noneSelected')}
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
          <div className="h-[380px] min-w-0 rounded-lg border border-border bg-background p-4 xl:h-[430px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series.points}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatValue}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatValue(value),
                    name,
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="originalValue"
                  name={t('series.original')}
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={renderSelectableDot}
                  activeDot={{ r: 5 }}
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

          <div className="space-y-3 rounded-lg border border-border bg-background p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                {t('sliceSelection.title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('sliceSelection.description')}
              </p>
            </div>

            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2 px-1">
                {slices.map((slice) => {
                  const isSelected = slice.id === selectedSliceId;

                  return (
                    <button
                      key={slice.id}
                      ref={(element) => {
                        sliceButtonRefs.current[slice.id] = element;
                      }}
                      type="button"
                      onClick={(event) => handleSliceButtonClick(event, slice.id)}
                      className={`rounded-md border px-3 py-2 text-sm transition ${
                        isSelected
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-card text-foreground hover:bg-muted'
                      }`}
                    >
                      {slice.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
              {selectedSlice
                ? t('sliceSelection.selected', {
                    slice: selectedSlice.label,
                  })
                : t('sliceSelection.noneSelected')}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
