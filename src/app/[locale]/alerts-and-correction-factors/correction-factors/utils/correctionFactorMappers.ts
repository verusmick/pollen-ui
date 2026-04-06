import type {
  ApiCorrectionFactorDetail,
  ApiCorrectionFactorRecord,
  ApiValidationEventRecord,
  CorrectionFactorDetail,
  CorrectionFactorFormValues,
  CorrectionFactorRecord,
  CorrectionFactorStatus,
  CorrectionFactorValidationEvent,
} from '../types';
import { UNKNOWN_POLLEN_CODE } from '../constants';

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

function deriveCorrectionFactorStatus(
  details: CorrectionFactorDetail[]
): CorrectionFactorStatus {
  if (details.length === 0) {
    return 'draft';
  }

  return details.every((detail) => detail.published) ? 'published' : 'draft';
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
    status: deriveCorrectionFactorStatus(details),
    details,
  };
}

export function mapApiCorrectionFactorsList(
  records: ApiCorrectionFactorRecord[]
): CorrectionFactorRecord[] {
  return records.map(mapApiCorrectionFactorRecord);
}

export function mapCorrectionFactorRecordToFormValues(
  record: CorrectionFactorRecord,
  options?: {
    detectedEvents?: number | null;
  }
): CorrectionFactorFormValues {
  const detectedEvents =
    options?.detectedEvents !== undefined ? options.detectedEvents : null;
  const normalizedRows = record.details.map((detail, index) => ({
    clientId: detail.id ?? `cf-detail-${record.id}-${index}`,
    pollen: detail.pollen,
    reviewedEvents:
      detectedEvents !== null
        ? String(detail.factorPercentage * detectedEvents)
        : String(detail.factorPercentage),
    isBasePollen: detail.pollen === record.basePollen,
  }));
  const baseRow = normalizedRows.find((row) => row.isBasePollen);
  const otherRows = normalizedRows.filter((row) => !row.isBasePollen);

  return {
    location: record.location,
    basePollen: record.basePollen,
    startDate: record.startDate.slice(0, 10),
    endDate: record.endDate.slice(0, 10),
    detectedEvents,
    publishOnSave: record.status === 'published',
    rows: baseRow
      ? [baseRow, ...otherRows]
      : [
          {
            clientId: `cf-base-${record.id}`,
            pollen: record.basePollen,
            reviewedEvents: '0',
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

  if (!id || !classification || datetime === null || !device) {
    return null;
  }

  return {
    id,
    classification,
    datetime,
    device,
    imageUrl: `${VALIDATION_EVENT_IMAGE_BASE_URL}/${id}/image.png`,
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
