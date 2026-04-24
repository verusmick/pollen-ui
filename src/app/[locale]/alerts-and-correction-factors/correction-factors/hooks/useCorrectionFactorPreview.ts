'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getCorrectionFactorMeasurements } from '@/lib/api/correctionFactors';
import { correctionFactorKeys } from '../constants';
import type {
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
  normalizeMeasurementsPreviewSource,
  toMeasurementPreviewRange,
} from '../utils';

interface UseCorrectionFactorPreviewOptions {
  values: CorrectionFactorFormValues;
  derived: CorrectionFactorFormDerivedState;
}

interface UseCorrectionFactorPreviewResult {
  status: CorrectionFactorPreviewStatus;
  series: CorrectionFactorPreviewSeries | null;
  slices: CorrectionFactorReviewSlice[];
  error: Error | null;
}

export function useCorrectionFactorPreview({
  values,
  derived,
}: UseCorrectionFactorPreviewOptions): UseCorrectionFactorPreviewResult {
  const range = useMemo(
    () => toMeasurementPreviewRange(values.startDate, values.endDate),
    [values.endDate, values.startDate]
  );
  const isReadyForPreview =
    Boolean(values.location) && Boolean(values.basePollen) && range !== null;
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
      if (!range || !values.basePollen) {
        return [];
      }

      const response = await getCorrectionFactorMeasurements({
        from: range.from,
        to: range.to,
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
  const slices = useMemo(
    () => buildCorrectionFactorReviewSlices(sourcePoints),
    [sourcePoints]
  );
  const series = useMemo(
    () =>
      sourcePoints.length > 0
        ? buildCorrectionFactorPreviewSeries(sourcePoints, basePollenMultiplier)
        : null,
    [basePollenMultiplier, sourcePoints]
  );

  if (!isReadyForPreview) {
    return {
      status: 'idle',
      series: null,
      slices: [],
      error: null,
    };
  }

  if (previewQuery.isLoading || previewQuery.isFetching) {
    return {
      status: 'loading',
      series: null,
      slices: [],
      error: null,
    };
  }

  if (previewQuery.isError) {
    return {
      status: 'error',
      series: null,
      slices: [],
      error: previewQuery.error instanceof Error ? previewQuery.error : null,
    };
  }

  if (!series || series.points.length === 0) {
    return {
      status: 'empty',
      series: null,
      slices: [],
      error: null,
    };
  }

  return {
    status: 'ready',
    series,
    slices,
    error: null,
  };
}
