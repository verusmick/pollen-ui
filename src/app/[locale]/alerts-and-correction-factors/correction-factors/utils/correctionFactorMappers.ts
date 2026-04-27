import type {
  ApiCorrectionFactorDetail,
  ApiCorrectionFactorRecord,
  ApiValidationEventRecord,
  CorrectionFactorDetail,
  CorrectionFactorFormValues,
  CorrectionFactorRecord,
  CorrectionFactorValidationEventCoordinates,
  CorrectionFactorValidationEvent,
} from '../types';
import { UNKNOWN_POLLEN_CODE } from '../constants';
import { normalizeCorrectionFactorDateTime } from './correctionFactorDateTime';

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

export function mapApiCorrectionFactorRecord(
  record: ApiCorrectionFactorRecord
): CorrectionFactorRecord {
  const details = record.correction_factor_details.map(
    mapApiCorrectionFactorDetail
  );

  return {
    id: String(record.id),
    location: record.location,
    basePollen: record.pollen,
    startDate: record.start_date,
    endDate: record.end_date,
    details,
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

  return {
    location: record.location,
    basePollen: record.basePollen,
    startDate: normalizeCorrectionFactorDateTime(record.startDate),
    endDate: normalizeCorrectionFactorDateTime(record.endDate),
    selectedReviewSliceId: null,
    detectedEvents: null,
    events: [],
    rows: baseRow
      ? [baseRow, ...otherRows]
      : [
          {
            clientId: `cf-base-${record.id}`,
            pollen: record.basePollen,
            reviewedEvents: '',
            storedMultiplier: null,
            isBasePollen: true,
          },
          ...otherRows,
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
