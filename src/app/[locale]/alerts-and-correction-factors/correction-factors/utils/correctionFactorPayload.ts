import type {
  ApiCorrectionFactorDetail,
  ApiCorrectionFactorWriteRequest,
  CorrectionFactorFormValues,
  CorrectionFactorPayloadBuildOptions,
} from '../types';
import { UNKNOWN_POLLEN_CODE } from '../constants';
import { buildCorrectionFactorDerivedState } from './correctionFactorMath';

function mapRowPollenToApiValue(
  pollen: string,
  unknownPollenApiValue?: string | null
): string | null {
  if (pollen !== UNKNOWN_POLLEN_CODE) {
    return pollen;
  }

  if (unknownPollenApiValue === undefined) {
    // TODO: Backend must confirm how Unknown is encoded in correction factor payloads.
    throw new Error('Unknown pollen API encoding is not configured.');
  }

  return unknownPollenApiValue;
}

export function buildCorrectionFactorWritePayload(
  values: CorrectionFactorFormValues,
  options: CorrectionFactorPayloadBuildOptions
): ApiCorrectionFactorWriteRequest {
  const derived = buildCorrectionFactorDerivedState(
    values,
    options.factorPercentageScale
  );

  const correctionFactorDetails: ApiCorrectionFactorDetail[] = derived.rows.map(
    (row) => {
      if (!row.pollen) {
        throw new Error('Cannot build payload with an empty pollen row.');
      }

      return {
        pollen: mapRowPollenToApiValue(
          row.pollen,
          options.unknownPollenApiValue
        ),
        factor_percentage: row.multiplier,
        published: values.publishOnSave,
      };
    }
  );

  return {
    start_date: values.startDate,
    end_date: values.endDate,
    pollen: values.basePollen,
    location: values.location,
    correction_factor_details: correctionFactorDetails,
  };
}
