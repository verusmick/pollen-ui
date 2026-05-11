'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getCorrectionFactorMeasurements } from '@/lib/api/correctionFactors';
import { correctionFactorKeys } from '../constants';
import type {
  CorrectionFactorChartRange,
  CorrectionFactorFormDerivedState,
  CorrectionFactorFormValues,
  CorrectionFactorReviewSlice,
  CorrectionFactorPreviewSeries,
  CorrectionFactorPreviewSourcePoint,
  CorrectionFactorPreviewStatus,
} from '../types';
import {
  buildCorrectionFactorReviewSlices,
  buildCorrectionFactorPreviewSeries,
  resolveCorrectionFactorVisibleRange,
  normalizeMeasurementsPreviewSource,
  toMeasurementPreviewRange,
} from '../utils';

interface UseCorrectionFactorPreviewOptions {
  values: CorrectionFactorFormValues;
  derived: CorrectionFactorFormDerivedState;
  visibleRange: CorrectionFactorChartRange | null;
}

interface UseCorrectionFactorPreviewResult {
  status: CorrectionFactorPreviewStatus;
  series: CorrectionFactorPreviewSeries | null;
  reviewSlices: CorrectionFactorReviewSlice[];
  error: Error | null;
}

export function useCorrectionFactorPreview({
  values,
  derived,
  visibleRange,
}: UseCorrectionFactorPreviewOptions): UseCorrectionFactorPreviewResult {
  const rootRange = useMemo(
    () => toMeasurementPreviewRange(values.startDate, values.endDate),
    [values.endDate, values.startDate]
  );
  const resolvedVisibleRange = useMemo(
    () => resolveCorrectionFactorVisibleRange(visibleRange, rootRange),
    [rootRange, visibleRange]
  );
  const isReadyForPreview =
    Boolean(values.location) && Boolean(values.basePollen) && rootRange !== null;
  const basePollenMultiplier =
    derived.rows.find((row) => row.isBasePollen)?.multiplier ?? 0;

  const previewQuery = useQuery({
    queryKey: correctionFactorKeys.preview({
      location: values.location,
      basePollen: values.basePollen,
      startDate: values.startDate,
      endDate: values.endDate,
    }),
    queryFn: async () => {
      if (!rootRange || !values.basePollen) {
        return [];
      }

      const response = await getCorrectionFactorMeasurements({
        from: rootRange.from,
        to: rootRange.to,
        locations: values.location,
        pollen: values.basePollen,
      });

      return normalizeMeasurementsPreviewSource(response, {
        location: values.location,
        pollen: values.basePollen,
      });
    },
    enabled: isReadyForPreview,
    staleTime: 1000 * 60 * 5,
  });

  const sourcePoints = (previewQuery.data ?? []) as CorrectionFactorPreviewSourcePoint[];
  const sourcePointsWithPersistedPeaks = useMemo(() => {
    if (values.peaks.length === 0) {
      return sourcePoints;
    }

    const sourcePointKeys = new Set(
      sourcePoints.map((point) => `${point.timestamp}-${point.endTimestamp}`)
    );
    const persistedSourcePoints = values.peaks
      .filter(
        (peak) =>
          !sourcePointKeys.has(`${peak.startTimestamp}-${peak.endTimestamp}`)
      )
      .map((peak) => ({
        timestamp: peak.startTimestamp,
        endTimestamp: peak.endTimestamp,
        displayTimestamp:
          peak.startTimestamp + (peak.endTimestamp - peak.startTimestamp) / 2,
        value: peak.value,
      }));

    return [...sourcePoints, ...persistedSourcePoints].sort(
      (left, right) => left.timestamp - right.timestamp
    );
  }, [sourcePoints, values.peaks]);
  const series = useMemo(
    () =>
      sourcePointsWithPersistedPeaks.length > 0 && resolvedVisibleRange
        ? buildCorrectionFactorPreviewSeries(
            sourcePointsWithPersistedPeaks,
            resolvedVisibleRange,
            basePollenMultiplier
          )
        : null,
    [basePollenMultiplier, resolvedVisibleRange, sourcePointsWithPersistedPeaks]
  );
  const reviewSlices = useMemo(
    () => buildCorrectionFactorReviewSlices(series),
    [series]
  );

  if (!isReadyForPreview) {
    return {
      status: 'idle',
      series: null,
      reviewSlices: [],
      error: null,
    };
  }

  if ((previewQuery.isLoading || previewQuery.isFetching) && !series) {
    return {
      status: 'loading',
      series: null,
      reviewSlices: [],
      error: null,
    };
  }

  if (previewQuery.isError && !series) {
    return {
      status: 'error',
      series: null,
      reviewSlices: [],
      error: previewQuery.error instanceof Error ? previewQuery.error : null,
    };
  }

  if (!series || series.points.length === 0) {
    return {
      status: 'empty',
      series: null,
      reviewSlices: [],
      error: null,
    };
  }

  return {
    status: 'ready',
    series,
    reviewSlices,
    error: null,
  };
}
