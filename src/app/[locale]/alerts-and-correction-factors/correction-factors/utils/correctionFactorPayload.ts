import type {
  ApiCorrectionFactorDetail,
  ApiCorrectionFactorWriteRequest,
  CorrectionFactorFormValues,
  CorrectionFactorPayloadBuildOptions,
} from '../types';
import { UNKNOWN_POLLEN_CODE } from '../constants';
import { buildCorrectionFactorDerivedState } from './correctionFactorMath';
import { toCorrectionFactorApiDateTime } from './correctionFactorDateTime';

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

  const correctionFactorDetails = derived.rows
    .map<ApiCorrectionFactorDetail | null>((row) => {
      if (!row.pollen) {
        throw new Error('Cannot build payload with an empty pollen row.');
      }

      if (row.isSyntheticUnknown || row.pollen === UNKNOWN_POLLEN_CODE) {
        return null;
      }

      return {
        pollen: row.pollen,
        factor_percentage: row.multiplier,
        published: values.publishOnSave,
      };
    })
    .filter((detail): detail is ApiCorrectionFactorDetail => detail !== null);

  if (options.unknownPollenApiValue === undefined) {
    // TODO: Backend has not confirmed whether Unknown should be sent explicitly.
    // Current UI behavior keeps Unknown as an implicit remainder and omits it from payloads.
  }

  return {
    start_date: startDate,
    end_date: endDate,
    pollen: values.basePollen,
    location: values.location,
    correction_factor_details: correctionFactorDetails,
  };
}
