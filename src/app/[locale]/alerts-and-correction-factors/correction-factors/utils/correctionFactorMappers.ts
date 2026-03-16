import type {
  ApiCorrectionFactorDetail,
  ApiCorrectionFactorRecord,
  CorrectionFactorDetail,
  CorrectionFactorFormValues,
  CorrectionFactorRecord,
  CorrectionFactorStatus,
} from '../types';
import { UNKNOWN_POLLEN_CODE } from '../constants';

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
  record: CorrectionFactorRecord
): CorrectionFactorFormValues {
  const normalizedRows = record.details.map((detail, index) => ({
    clientId: detail.id ?? `cf-detail-${record.id}-${index}`,
    pollen: detail.pollen,
    reviewedEvents: String(detail.factorPercentage),
    isBasePollen: detail.pollen === record.basePollen,
  }));
  const baseRow = normalizedRows.find((row) => row.isBasePollen);
  const otherRows = normalizedRows.filter((row) => !row.isBasePollen);

  return {
    location: record.location,
    basePollen: record.basePollen,
    startDate: record.startDate.slice(0, 10),
    endDate: record.endDate.slice(0, 10),
    // The backend stores only factor_percentage values.
    // Normalize edit hydration to a detected-events total of 1 so the
    // existing form math continues to derive the same multipliers.
    detectedEvents: 1,
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
