import type {
  ApiCorrectionFactorDetail,
  ApiCorrectionFactorPeak,
  ApiCorrectionFactorPeakImage,
  ApiCorrectionFactorRecord,
  ApiValidationEventRecord,
  CorrectionFactorDetail,
  CorrectionFactorFormValues,
  CorrectionFactorPeak,
  CorrectionFactorPeakImage,
  CorrectionFactorRecord,
  CorrectionFactorReviewedValidationEvent,
  CorrectionFactorValidationEventCoordinates,
  CorrectionFactorValidationEvent,
} from '../types';
import { UNKNOWN_POLLEN_CODE } from '../constants';
import {
  normalizeCorrectionFactorDateTime,
  toCorrectionFactorUnixTimestampFromApiDateTime,
} from './correctionFactorDateTime';

const VALIDATION_EVENT_IMAGE_BASE_URL =
  'https://validation.pollenscience.eu/resources/classifications';

function normalizeString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

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

function buildReviewSliceId(from: number, to: number): string {
  return `measurement-${from}-${to}`;
}

function normalizeValidationEventCoordinates(
  value: unknown
): CorrectionFactorValidationEventCoordinates | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const x = normalizeFiniteNumber(record.x);
  const y = normalizeFiniteNumber(record.y);
  const width = normalizeFiniteNumber(record.width);
  const height = normalizeFiniteNumber(record.height);

  if (
    x === null ||
    y === null ||
    width === null ||
    height === null ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  return {
    x,
    y,
    width,
    height,
  };
}

export function mapApiCorrectionFactorDetail(
  detail: ApiCorrectionFactorDetail
): CorrectionFactorDetail {
  return {
    id: detail.id !== undefined ? String(detail.id) : undefined,
    pollen: detail.pollen ?? UNKNOWN_POLLEN_CODE,
    factorPercentage: detail.factor_percentage,
    published: detail.published,
  };
}

export function mapApiCorrectionFactorPeakImage(
  image: ApiCorrectionFactorPeakImage
): CorrectionFactorPeakImage | null {
  const id = normalizeString(image._id);
  const pollen = normalizeString(image.pollen);
  const location = normalizeString(image.location);
  const datetime = normalizeString(image.datetime);
  const x = normalizeFiniteNumber(image.x);
  const y = normalizeFiniteNumber(image.y);
  const width = normalizeFiniteNumber(image.width);
  const height = normalizeFiniteNumber(image.height);
  const index = normalizeFiniteNumber(image.index);
  const timestamp = datetime
    ? toCorrectionFactorUnixTimestampFromApiDateTime(datetime)
    : null;

  if (
    !id ||
    !pollen ||
    !location ||
    !datetime ||
    timestamp === null ||
    x === null ||
    y === null ||
    width === null ||
    height === null ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  return {
    id,
    pollen,
    location,
    datetime,
    timestamp,
    coordinates: {
      x,
      y,
      width,
      height,
    },
    index,
  };
}

export function mapApiCorrectionFactorPeak(
  peak: ApiCorrectionFactorPeak,
  index: number
): CorrectionFactorPeak | null {
  const pollen = normalizeString(peak.pollen);
  const location = normalizeString(peak.location);
  const startDate = normalizeString(peak.start_date);
  const endDate = normalizeString(peak.end_date);
  const value = normalizeFiniteNumber(peak.value);
  const startTimestamp = startDate
    ? toCorrectionFactorUnixTimestampFromApiDateTime(startDate)
    : null;
  const endTimestamp = endDate
    ? toCorrectionFactorUnixTimestampFromApiDateTime(endDate)
    : null;

  if (
    !pollen ||
    !location ||
    !startDate ||
    !endDate ||
    startTimestamp === null ||
    endTimestamp === null ||
    value === null
  ) {
    return null;
  }

  const images = Array.isArray(peak.images)
    ? peak.images
        .map(mapApiCorrectionFactorPeakImage)
        .filter(
          (
            image: CorrectionFactorPeakImage | null
          ): image is CorrectionFactorPeakImage => image !== null
        )
    : [];

  return {
    id: buildReviewSliceId(startTimestamp, endTimestamp),
    pollen,
    location,
    startDate,
    endDate,
    startTimestamp,
    endTimestamp,
    value,
    images,
  };
}

export function mapPeakImageToReviewedValidationEvent(
  image: CorrectionFactorPeakImage,
  reviewedPollen: CorrectionFactorRecord['basePollen']
): CorrectionFactorReviewedValidationEvent {
  return {
    id: image.id,
    classification: image.pollen,
    datetime: image.timestamp,
    device: image.location,
    imageUrl: `${VALIDATION_EVENT_IMAGE_BASE_URL}/${image.id}/image.png`,
    coordinates: image.coordinates,
    index: image.index,
    reviewedPollen,
  };
}

function estimateDetectedEventsFromStoredMultiplier(
  selectedImageCount: number,
  storedMultiplier: number | null | undefined
): number {
  if (
    selectedImageCount <= 0 ||
    typeof storedMultiplier !== 'number' ||
    !Number.isFinite(storedMultiplier) ||
    storedMultiplier <= 0
  ) {
    return selectedImageCount;
  }

  return Math.max(selectedImageCount, Math.round(selectedImageCount / storedMultiplier));
}

export function mapApiCorrectionFactorRecord(
  record: ApiCorrectionFactorRecord
): CorrectionFactorRecord {
  const details = record.correction_factor_details.map(
    mapApiCorrectionFactorDetail
  );
  const peaks = (record.peaks ?? [])
    .map(mapApiCorrectionFactorPeak)
    .filter(
      (peak: CorrectionFactorPeak | null): peak is CorrectionFactorPeak =>
        peak !== null
    );

  return {
    id: String(record.id),
    location: record.location,
    basePollen: record.pollen,
    startDate: record.start_date,
    endDate: record.end_date,
    details,
    peaks,
  };
}

export function mapApiCorrectionFactorsList(
  records: ApiCorrectionFactorRecord[]
): CorrectionFactorRecord[] {
  return records.map(mapApiCorrectionFactorRecord);
}

export function mapCorrectionFactorRecordToFormValues(
  record: CorrectionFactorRecord
): CorrectionFactorFormValues {
  const normalizedRows = record.details.map((detail, index) => ({
    clientId: detail.id ?? `cf-detail-${record.id}-${index}`,
    pollen: detail.pollen,
    reviewedEvents: '',
    storedMultiplier: detail.factorPercentage,
    isBasePollen: detail.pollen === record.basePollen,
  }));
  const baseRow = normalizedRows.find((row) => row.isBasePollen);
  const otherRows = normalizedRows.filter((row) => !row.isBasePollen);
  const baseStoredMultiplier = baseRow?.storedMultiplier;
  const selectedPeak = record.peaks[0] ?? null;
  const restoredEvents = selectedPeak
    ? selectedPeak.images.map((image) =>
        mapPeakImageToReviewedValidationEvent(image, record.basePollen)
      )
    : [];
  const restoredBasePollenCount = restoredEvents.filter(
    (event) => event.reviewedPollen === record.basePollen
  ).length;
  const restoredDetectedEvents =
    selectedPeak && restoredEvents.length > 0
      ? estimateDetectedEventsFromStoredMultiplier(
          restoredBasePollenCount,
          baseStoredMultiplier
        )
      : null;
  const restoredBaseReviewedEvents =
    restoredBasePollenCount > 0 ? String(restoredBasePollenCount) : '';
  const restoredOtherRows = otherRows.map((row) => {
    const reviewedEventsCount = restoredEvents.filter(
      (event) => event.reviewedPollen === row.pollen
    ).length;

    return {
      ...row,
      reviewedEvents:
        reviewedEventsCount > 0 ? String(reviewedEventsCount) : row.reviewedEvents,
    };
  });
  const restoredBaseRow = baseRow
    ? {
        ...baseRow,
        reviewedEvents: restoredBaseReviewedEvents,
      }
    : null;

  return {
    location: record.location,
    basePollen: record.basePollen,
    ruleEnabled: record.details[0]?.published ?? false,
    startDate: normalizeCorrectionFactorDateTime(record.startDate),
    endDate: normalizeCorrectionFactorDateTime(record.endDate),
    selectedReviewSliceId: selectedPeak?.id ?? null,
    detectedEvents: restoredDetectedEvents,
    multiplierMode: 'eventBased',
    reviewStateSource: 'persisted',
    manualMultiplier:
      typeof baseStoredMultiplier === 'number' ? String(baseStoredMultiplier) : '',
    events: restoredEvents,
    peaks: record.peaks,
    rows: restoredBaseRow
      ? [restoredBaseRow, ...restoredOtherRows]
      : [
          {
            clientId: `cf-base-${record.id}`,
            pollen: record.basePollen,
            reviewedEvents: restoredBaseReviewedEvents,
            storedMultiplier: null,
            isBasePollen: true,
          },
          ...restoredOtherRows,
        ],
  };
}

export function mapApiValidationEvent(
  record: ApiValidationEventRecord
): CorrectionFactorValidationEvent | null {
  const id = normalizeString(record._id);
  const classification = normalizeString(record.classification);
  const datetime = normalizeFiniteNumber(record.datetime);
  const device = normalizeString(record.device);
  const index = normalizeFiniteNumber(record.index);
  const coordinates = normalizeValidationEventCoordinates(record.coordinates);

  if (!id || !classification || datetime === null || !device) {
    return null;
  }

  return {
    id,
    classification,
    datetime,
    device,
    imageUrl: `${VALIDATION_EVENT_IMAGE_BASE_URL}/${id}/image.png`,
    coordinates,
    index,
  };
}

export function normalizeValidationEventsResponse(
  payload: ApiValidationEventRecord[]
): CorrectionFactorValidationEvent[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map(mapApiValidationEvent)
    .filter(
      (
        event: CorrectionFactorValidationEvent | null
      ): event is CorrectionFactorValidationEvent => event !== null
    )
    .sort((left, right) => left.datetime - right.datetime);
}
