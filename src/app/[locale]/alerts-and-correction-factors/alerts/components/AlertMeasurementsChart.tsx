'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
} from 'recharts';

import type { NotificationMessageRecord } from '@/app/[locale]/rules-and-notifications/types';

import { useAlertMeasurements } from '../hooks';

interface AlertMeasurementsChartProps {
  record?: NotificationMessageRecord;
}

interface AlertChartPoint {
  timestamp: number;
  measurementValue: number | null;
  alertValue: number | null;
  isAlert: boolean;
}

interface AlertMarkerShapeProps {
  cx?: number;
  cy?: number;
}

interface MeasurementDotProps {
  cx?: number;
  cy?: number;
  payload?: AlertChartPoint;
}

interface HoveredMeasurement {
  point: AlertChartPoint;
  x: number;
  y: number;
}

const NEW_CORRECTION_FACTOR_PATH =
  '/alerts-and-correction-factors/correction-factors/new';
const ALERT_CALLOUT_WIDTH_PX = 224;
const ALERT_CALLOUT_OFFSET_PX = 26;
const MEASUREMENT_TOOLTIP_OFFSET_PX = 14;

function formatNumber(
  value: number | null | undefined,
  locale: string
): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }).format(value)
    : '';
}

function formatDateTime(timestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp * 1000));
}

function buildCorrectionFactorHref(
  record: NotificationMessageRecord,
  locale: string
): string {
  const query = new URLSearchParams({
    alertId: record.id,
    pollen: record.pollen,
    location: record.location,
    date: record.creationDate,
  });

  if (record.value !== null) {
    query.set('value', String(record.value));
  }

  return `/${locale}${NEW_CORRECTION_FACTOR_PATH}?${query.toString()}`;
}

function openCorrectionFactorWindow(href: string) {
  window.open(
    href,
    'create-correction-factor',
    'popup=yes,width=1500,height=900,noopener,noreferrer'
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getChartValueDomain(points: AlertChartPoint[]): {
  min: number;
  max: number;
} {
  const values = points
    .flatMap((point) => [point.measurementValue, point.alertValue])
    .filter((value): value is number => typeof value === 'number');

  if (values.length === 0) {
    return { min: 0, max: 1 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    const padding = Math.max(Math.abs(min) * 0.1, 1);
    return { min: min - padding, max: max + padding };
  }

  const padding = (max - min) * 0.12;

  return { min: min - padding, max: max + padding };
}

function getAlertCalloutStyle(params: {
  alertPoint: AlertChartPoint;
  range: { from: number; to: number };
  domain: { min: number; max: number };
}): CSSProperties {
  const xRatio =
    params.range.to === params.range.from
      ? 0.5
      : (params.alertPoint.timestamp - params.range.from) /
        (params.range.to - params.range.from);
  const yRatio =
    params.domain.max === params.domain.min ||
    params.alertPoint.alertValue === null
      ? 0.35
      : (params.alertPoint.alertValue - params.domain.min) /
        (params.domain.max - params.domain.min);
  const xPercent = clamp(xRatio * 100, 8, 92);
  const yPercent = clamp((1 - yRatio) * 100, 12, 70);
  const opensLeft = xPercent > 62;

  return {
    left: `${xPercent}%`,
    top: `${yPercent}%`,
    width: ALERT_CALLOUT_WIDTH_PX,
    transform: opensLeft
      ? `translate(calc(-100% - ${ALERT_CALLOUT_OFFSET_PX}px), -50%)`
      : `translate(${ALERT_CALLOUT_OFFSET_PX}px, -50%)`,
  };
}

function getMeasurementTooltipStyle(hovered: HoveredMeasurement): CSSProperties {
  const opensLeft = hovered.x > 520;

  return {
    left: hovered.x,
    top: hovered.y,
    transform: opensLeft
      ? `translate(calc(-100% - ${MEASUREMENT_TOOLTIP_OFFSET_PX}px), -50%)`
      : `translate(${MEASUREMENT_TOOLTIP_OFFSET_PX}px, -50%)`,
  };
}

function AlertMarkerShape({ cx, cy }: AlertMarkerShapeProps) {
  if (
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    !Number.isFinite(cx) ||
    !Number.isFinite(cy)
  ) {
    return null;
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="#dc2626" fillOpacity={0.18} />
      <circle cx={cx} cy={cy} r={4.5} fill="#dc2626" stroke="#ffffff" strokeWidth={2} />
    </g>
  );
}

export function AlertMeasurementsChart({ record }: AlertMeasurementsChartProps) {
  const locale = useLocale();
  const t = useTranslations('alertsAndCorrectionFactorsPage.alerts.form.chart');
  const sharedT = useTranslations('messageSystemPage.shared');
  const unavailable = sharedT('notAvailable');
  const [hoveredMeasurement, setHoveredMeasurement] =
    useState<HoveredMeasurement | null>(null);
  const {
    alertTimestamp,
    range,
    points,
    isLoading,
    isFetching,
    isError,
  } = useAlertMeasurements(record);
  const correctionFactorHref = record
    ? buildCorrectionFactorHref(record, locale)
    : '';
  const chartPoints = useMemo<AlertChartPoint[]>(() => {
    const measurementPoints = points.map((point) => ({
      timestamp: point.timestamp + (point.endTimestamp - point.timestamp) / 2,
      measurementValue: point.value,
      alertValue: null,
      isAlert: false,
    }));

    if (alertTimestamp === null || !record || record.value === null) {
      return measurementPoints;
    }

    return [
      ...measurementPoints,
      {
        timestamp: alertTimestamp,
        measurementValue: null,
        alertValue: record.value,
        isAlert: true,
      },
    ].sort((left, right) => left.timestamp - right.timestamp);
  }, [alertTimestamp, points, record]);
  const alertPoint = chartPoints.find((point) => point.isAlert) ?? null;
  const hasMeasurementPoints = points.length > 0;
  const alertMarkerDateLabel = alertPoint
    ? `${t('tooltip.alertOccurred')} · ${formatDateTime(
        alertPoint.timestamp,
        locale
      )}`
    : '';
  const alertValueLabel =
    record && record.value !== null
      ? `${formatNumber(record.value, locale)} Pollen/m³`
      : unavailable;
  const valueDomain = useMemo(
    () => getChartValueDomain(chartPoints),
    [chartPoints]
  );
  const alertCalloutStyle =
    alertPoint && range
      ? getAlertCalloutStyle({
          alertPoint,
          range,
          domain: valueDomain,
        })
      : null;
  const hoveredMeasurementValue = formatNumber(
    hoveredMeasurement?.point.measurementValue,
    locale
  );

  function renderMeasurementDot({ cx, cy, payload }: MeasurementDotProps) {
    if (
      typeof cx !== 'number' ||
      typeof cy !== 'number' ||
      !Number.isFinite(cx) ||
      !Number.isFinite(cy) ||
      !payload ||
      payload.isAlert
    ) {
      return null;
    }

    return (
      <circle
        cx={cx}
        cy={cy}
        r={3.5}
        fill="#2563eb"
        stroke="#ffffff"
        strokeWidth={1}
        onMouseEnter={() => setHoveredMeasurement({ point: payload, x: cx, y: cy })}
        onMouseLeave={() => setHoveredMeasurement(null)}
        className="cursor-pointer"
      />
    );
  }

  return (
    <section className="grid gap-3 rounded-md border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{t('title')}</h2>
          <p className="text-xs text-muted-foreground">{t('description')}</p>
        </div>
        {isFetching && !isLoading ? (
          <span className="text-xs text-muted-foreground">{t('states.updating')}</span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
          {t('states.loading')}
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t('states.error')}
        </div>
      ) : null}

      {!isLoading && !isError && !hasMeasurementPoints ? (
        <div className="rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
          {t('states.empty')}
        </div>
      ) : null}

      {!isLoading && !isError && chartPoints.length > 0 && range ? (
        <div className="relative h-72 min-w-0 overflow-visible">
          {hoveredMeasurement ? (
            <div
              className="pointer-events-none absolute z-20 grid gap-1 rounded-md border border-border bg-card p-3 text-xs text-foreground shadow-lg"
              style={getMeasurementTooltipStyle(hoveredMeasurement)}
            >
              <div className="font-medium">
                {formatDateTime(hoveredMeasurement.point.timestamp, locale)}
              </div>
              <div className="text-muted-foreground">
                {hoveredMeasurementValue
                  ? `${hoveredMeasurementValue} Pollen/m³`
                  : unavailable}
              </div>
            </div>
          ) : null}
          {alertPoint && record && alertCalloutStyle ? (
            <div
              className="absolute z-10 grid gap-2 rounded-md border border-border bg-card p-3 text-xs text-foreground shadow-lg"
              style={alertCalloutStyle}
            >
              <div className="font-semibold text-red-700">
                {alertMarkerDateLabel}
              </div>
              <div className="text-muted-foreground">{alertValueLabel}</div>
              <button
                type="button"
                onClick={() => openCorrectionFactorWindow(correctionFactorHref)}
                className="mt-1 rounded-md bg-primary px-2 py-1.5 text-xs font-medium text-white hover:opacity-90"
              >
                {t('actions.createCorrectionFactor')}
              </button>
            </div>
          ) : null}
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartPoints}
              margin={{ top: 10, right: 18, bottom: 4, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={[range.from, range.to]}
                tickFormatter={(value) => formatDateTime(Number(value), locale)}
                tick={{ fontSize: 11 }}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                width={44}
                domain={[valueDomain.min, valueDomain.max]}
                tickFormatter={(value) => formatNumber(Number(value), locale)}
              />
              {alertTimestamp !== null ? (
                <ReferenceLine
                  x={alertTimestamp}
                  stroke="#dc2626"
                  strokeDasharray="4 4"
                />
              ) : null}
              <Line
                type="monotone"
                dataKey="measurementValue"
                stroke="#2563eb"
                strokeWidth={2}
                dot={renderMeasurementDot}
                activeDot={false}
                connectNulls
              />
              {alertPoint ? (
                <Scatter
                  data={[alertPoint]}
                  dataKey="alertValue"
                  fill="#dc2626"
                  shape={<AlertMarkerShape />}
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  );
}
