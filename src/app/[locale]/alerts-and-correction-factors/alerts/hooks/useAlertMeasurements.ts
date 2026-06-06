'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { NotificationMessageRecord } from '@/app/[locale]/rules-and-notifications/types';
import { getAlertOccurrenceDate } from '../utils/alertNotificationMessages';

const ALERT_MEASUREMENT_WINDOW_SECONDS = 3 * 24 * 60 * 60;

export interface AlertMeasurementPoint {
  timestamp: number;
  endTimestamp: number;
  value: number;
}

interface AlertMeasurementRange {
  from: number;
  to: number;
}

interface UseAlertMeasurementsResult {
  alertTimestamp: number | null;
  range: AlertMeasurementRange | null;
  points: AlertMeasurementPoint[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
}

function toFiniteNumber(value: unknown): number | null {
  const numberValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeMeasurementPoints(
  payload: unknown,
  params: {
    location: string;
    pollen: string;
  }
): AlertMeasurementPoint[] {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return [];
  }

  const measurements = (payload as Record<string, unknown>).measurements;

  if (!Array.isArray(measurements)) {
    return [];
  }

  const matchingMeasurement = measurements.find((measurement) => {
    if (!measurement || typeof measurement !== 'object' || Array.isArray(measurement)) {
      return false;
    }

    const record = measurement as Record<string, unknown>;
    const location = normalizeString(record.location);
    const pollen = normalizeString(record.pollen ?? record.polle);

    return location === params.location && pollen === params.pollen;
  });

  if (
    !matchingMeasurement ||
    typeof matchingMeasurement !== 'object' ||
    Array.isArray(matchingMeasurement)
  ) {
    return [];
  }

  const data = (matchingMeasurement as Record<string, unknown>).data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item): AlertMeasurementPoint | null => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const timestamp = toFiniteNumber(record.from);
      const endTimestamp = toFiniteNumber(record.to);
      const value = toFiniteNumber(record.value);

      if (timestamp === null || value === null) {
        return null;
      }

      return {
        timestamp,
        endTimestamp: endTimestamp ?? timestamp,
        value,
      };
    })
    .filter((point): point is AlertMeasurementPoint => point !== null)
    .sort((left, right) => left.timestamp - right.timestamp);
}

async function getAlertMeasurements(params: {
  from: number;
  to: number;
  location: string;
  pollen: string;
}): Promise<AlertMeasurementPoint[]> {
  const query = new URLSearchParams({
    from: String(params.from),
    to: String(params.to),
    locations: params.location,
    pollen: params.pollen,
  });
  const response = await fetch(`/api/measurements?${query.toString()}`);

  if (!response.ok) {
    throw new Error(`Measurements request failed (${response.status}).`);
  }

  const payload = await response.json();

  return normalizeMeasurementPoints(payload, {
    location: params.location,
    pollen: params.pollen,
  });
}

function getAlertTimestamp(record?: NotificationMessageRecord): number | null {
  const occurrenceDate = getAlertOccurrenceDate(record);

  if (!occurrenceDate) {
    return null;
  }

  const timestamp = Date.parse(occurrenceDate);

  return Number.isFinite(timestamp) ? Math.floor(timestamp / 1000) : null;
}

export function useAlertMeasurements(
  record?: NotificationMessageRecord
): UseAlertMeasurementsResult {
  const alertTimestamp = useMemo(() => getAlertTimestamp(record), [record]);
  const range = useMemo<AlertMeasurementRange | null>(
    () =>
      alertTimestamp === null
        ? null
        : {
            from: alertTimestamp - ALERT_MEASUREMENT_WINDOW_SECONDS,
            to: alertTimestamp + ALERT_MEASUREMENT_WINDOW_SECONDS,
          },
    [alertTimestamp]
  );
  const enabled =
    Boolean(record?.pollen) &&
    Boolean(record?.location) &&
    alertTimestamp !== null &&
    range !== null;
  const query = useQuery({
    queryKey: [
      'alerts',
      'measurements',
      record?.id ?? '',
      record?.pollen ?? '',
      record?.location ?? '',
      range?.from ?? '',
      range?.to ?? '',
    ],
    queryFn: async () => {
      if (!record?.pollen || !record.location || !range) {
        return [];
      }

      return getAlertMeasurements({
        from: range.from,
        to: range.to,
        location: record.location,
        pollen: record.pollen,
      });
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  return {
    alertTimestamp,
    range,
    points: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
  };
}
