'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getCorrectionFactorValidationEvents } from '@/lib/api/correctionFactors';
import type {
  CorrectionFactorValidationEvent,
  CorrectionFactorValidationEventsStatus,
} from '../types';
import {
  VALIDATION_EVENTS_RESPONSE_MISMATCH,
  normalizeValidationEventsResponse,
  toMeasurementPreviewRange,
} from '../utils';
import { correctionFactorKeys } from '../constants';

interface UseCorrectionFactorValidationEventsOptions {
  location: string;
  basePollen: string;
  startDate: string;
  endDate: string;
}

interface UseCorrectionFactorValidationEventsResult {
  status: CorrectionFactorValidationEventsStatus;
  events: CorrectionFactorValidationEvent[];
  detectedEvents: number | null;
  error: Error | null;
  isReady: boolean;
}

export function useCorrectionFactorValidationEvents({
  location,
  basePollen,
  startDate,
  endDate,
}: UseCorrectionFactorValidationEventsOptions): UseCorrectionFactorValidationEventsResult {
  const range = useMemo(
    () => toMeasurementPreviewRange(startDate, endDate),
    [endDate, startDate]
  );
  const isReady = Boolean(location) && Boolean(basePollen) && range !== null;

  const validationEventsQuery = useQuery({
    queryKey: correctionFactorKeys.validationEvent({
      location,
      basePollen,
      startDate,
      endDate,
    }),
    queryFn: async () => {
      if (!range || !location || !basePollen) {
        return [];
      }

      const response = await getCorrectionFactorValidationEvents({
        from: range.from,
        to: range.to,
        location,
        classification: basePollen,
      });

      const normalized = normalizeValidationEventsResponse(response);

      if (response.length > 0 && normalized.length === 0) {
        throw new Error(VALIDATION_EVENTS_RESPONSE_MISMATCH);
      }

      return normalized;
    },
    enabled: isReady,
    staleTime: 1000 * 60 * 5,
  });

  const events = validationEventsQuery.data ?? [];

  if (!isReady) {
    return {
      status: 'idle',
      events: [],
      detectedEvents: null,
      error: null,
      isReady: false,
    };
  }

  if (validationEventsQuery.isLoading || validationEventsQuery.isFetching) {
    return {
      status: 'loading',
      events: [],
      detectedEvents: null,
      error: null,
      isReady: true,
    };
  }

  if (validationEventsQuery.isError) {
    return {
      status: 'error',
      events: [],
      detectedEvents: null,
      error:
        validationEventsQuery.error instanceof Error
          ? validationEventsQuery.error
          : null,
      isReady: true,
    };
  }

  if (events.length === 0) {
    return {
      status: 'empty',
      events: [],
      detectedEvents: 0,
      error: null,
      isReady: true,
    };
  }

  return {
    status: 'ready',
    events,
    detectedEvents: events.length,
    error: null,
    isReady: true,
  };
}
