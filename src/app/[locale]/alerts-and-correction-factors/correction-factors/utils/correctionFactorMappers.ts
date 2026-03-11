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
  _record: CorrectionFactorRecord
): CorrectionFactorFormValues {
  // TODO: Edit hydration is blocked until backend confirms GET by id support
  // and provides enough data to reconstruct reviewedEvents from stored factors.
  throw new Error(
    'Correction factor edit hydration is not supported by the current backend contract.'
  );
}
