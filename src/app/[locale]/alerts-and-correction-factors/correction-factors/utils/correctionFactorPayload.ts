import type {
  ApiCorrectionFactorDetail,
  ApiCorrectionFactorPeak,
  ApiCorrectionFactorPeakImage,
  ApiCorrectionFactorWriteRequest,
  CorrectionFactorPeak,
  CorrectionFactorPeakImage,
  CorrectionFactorFormValues,
  CorrectionFactorPayloadBuildOptions,
  CorrectionFactorReviewedValidationEvent,
} from '../types';
import { UNKNOWN_POLLEN_CODE } from '../constants';
import { buildCorrectionFactorDerivedState } from './correctionFactorMath';
import {
  toCorrectionFactorApiDateTime,
  toCorrectionFactorApiDateTimeFromUnixTimestamp,
} from './correctionFactorDateTime';

function toPeakApiDateTime(value: string): string {
  return toCorrectionFactorApiDateTime(value) ?? value;
}

function mapPeakImageToApi(
  image: CorrectionFactorPeakImage
): ApiCorrectionFactorPeakImage {
  return {
    pollen: image.pollen,
    location: image.location,
    datetime: image.datetime,
    x: image.coordinates.x,
    y: image.coordinates.y,
    width: image.coordinates.width,
    height: image.coordinates.height,
    _id: image.id,
    index: image.index,
  };
}

function mapReviewedEventToPeakImage(
  event: CorrectionFactorReviewedValidationEvent,
  values: CorrectionFactorFormValues
): CorrectionFactorPeakImage | null {
  if (
    event.reviewedPollen === UNKNOWN_POLLEN_CODE ||
    !event.coordinates ||
    !values.location
  ) {
    return null;
  }

  const datetime = toCorrectionFactorApiDateTimeFromUnixTimestamp(event.datetime);

  if (!datetime) {
    return null;
  }

  return {
    id: event.id,
    pollen: event.reviewedPollen,
    location: values.location,
    datetime,
    timestamp: event.datetime,
    coordinates: event.coordinates,
    index: event.index,
  };
}

function getPeakImagesForPayload(
  peak: CorrectionFactorPeak,
  values: CorrectionFactorFormValues
): CorrectionFactorPeakImage[] {
  if (peak.id !== values.selectedReviewSliceId || values.events.length === 0) {
    return peak.images;
  }

  return values.events
    .map((event) => mapReviewedEventToPeakImage(event, values))
    .filter(
      (
        image: CorrectionFactorPeakImage | null
      ): image is CorrectionFactorPeakImage => image !== null
    );
}

function buildCorrectionFactorPeaks(
  values: CorrectionFactorFormValues
): ApiCorrectionFactorPeak[] {
  return values.peaks.reduce<ApiCorrectionFactorPeak[]>((peaks, peak) => {
    const images = getPeakImagesForPayload(peak, values);

    if (images.length === 0) {
      return peaks;
    }

    peaks.push({
      pollen: peak.pollen,
      location: peak.location,
      start_date: toPeakApiDateTime(peak.startDate),
      end_date: toPeakApiDateTime(peak.endDate),
      value: peak.value,
      images: images.map(mapPeakImageToApi),
    });

    return peaks;
  }, []);
}

export function buildCorrectionFactorWritePayload(
  values: CorrectionFactorFormValues,
  options: CorrectionFactorPayloadBuildOptions
): ApiCorrectionFactorWriteRequest {
  const startDate = toCorrectionFactorApiDateTime(values.startDate);
  const endDate = toCorrectionFactorApiDateTime(values.endDate);

  if (!startDate || !endDate) {
    throw new Error('Correction factor payload requires valid start and end datetimes.');
  }

  const derived = buildCorrectionFactorDerivedState(
    values,
    options.factorPercentageScale
  );
  const preferStoredMultipliers = options.preferStoredMultipliers ?? false;

  const correctionFactorDetails = derived.rows.reduce<ApiCorrectionFactorDetail[]>(
    (details, derivedRow) => {
      if (!derivedRow.pollen) {
        throw new Error('Cannot build payload with an empty pollen row.');
      }

      if (
        derivedRow.isSyntheticUnknown ||
        derivedRow.pollen === UNKNOWN_POLLEN_CODE
      ) {
        return details;
      }

      const sourceRow = values.rows.find(
        (candidate) => candidate.clientId === derivedRow.clientId
      );
      const factorPercentage =
        preferStoredMultipliers && sourceRow?.storedMultiplier !== undefined
          ? sourceRow.storedMultiplier ?? derivedRow.multiplier
          : derivedRow.multiplier;

      details.push({
        pollen: derivedRow.pollen,
        factor_percentage: factorPercentage,
        published: details.length === 0 ? values.ruleEnabled : false,
      });

      return details;
    },
    []
  );

  if (options.unknownPollenApiValue === undefined) {
    // TODO: Backend has not confirmed whether Unknown should be sent explicitly.
    // Current UI behavior keeps Unknown as an implicit remainder and omits it from payloads.
  }

  const payload: ApiCorrectionFactorWriteRequest = {
    start_date: startDate,
    end_date: endDate,
    pollen: values.basePollen,
    location: values.location,
    correction_factor_details: correctionFactorDetails,
  };

  if (values.multiplierMode === 'manual') {
    if (values.peaks.length > 0) {
      payload.peaks = [];
    }

    return payload;
  }

  const peaks = buildCorrectionFactorPeaks(values);

  if (peaks.length > 0) {
    payload.peaks = peaks;
  }

  return payload;
}
