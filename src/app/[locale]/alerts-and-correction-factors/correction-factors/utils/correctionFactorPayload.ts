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

  return {
    start_date: startDate,
    end_date: endDate,
    pollen: values.basePollen,
    location: values.location,
    correction_factor_details: correctionFactorDetails,
  };
}
