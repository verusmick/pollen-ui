import type {
  CorrectionFactorFormErrors,
  CorrectionFactorFormValues,
} from '../types';
import { UNKNOWN_POLLEN_CODE } from '../constants';

function isValidNonNegativeNumber(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

export function validateCorrectionFactorForm(
  values: CorrectionFactorFormValues
): CorrectionFactorFormErrors {
  const errors: CorrectionFactorFormErrors = {
    rowErrorsById: {},
  };

  if (!values.location) {
    errors.location = 'Location is required.';
  }

  if (!values.basePollen) {
    errors.basePollen = 'Base pollen is required.';
  }

  if (!values.startDate) {
    errors.startDate = 'Start date is required.';
  }

  if (!values.endDate) {
    errors.endDate = 'End date is required.';
  }

  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    errors.endDate = 'End date must be after or equal to start date.';
  }

  if (values.detectedEvents === null) {
    errors.detectedEvents = 'Detected events are required.';
  }

  if (values.rows.length === 0) {
    errors.rows = 'At least one correction row is required.';
    return errors;
  }

  const baseRows = values.rows.filter((row) => row.isBasePollen);
  if (baseRows.length !== 1) {
    errors.rows = 'Exactly one base pollen row is required.';
  } else {
    const [baseRow] = baseRows;
    if (values.rows[0]?.clientId !== baseRow.clientId) {
      errors.rows = 'The base pollen row must be the first row.';
    }

    if (values.basePollen && baseRow.pollen !== values.basePollen) {
      errors.rows = 'The base pollen row must match the selected base pollen.';
    }
  }

  const pollenCounts = new Map<string, number>();
  let totalReviewedEvents = 0;
  let unknownCount = 0;

  for (const row of values.rows) {
    if (!row.pollen) {
      errors.rowErrorsById[row.clientId] = {
        ...errors.rowErrorsById[row.clientId],
        pollen: 'Pollen is required.',
      };
    } else {
      pollenCounts.set(row.pollen, (pollenCounts.get(row.pollen) ?? 0) + 1);
    }

    if (!isValidNonNegativeNumber(row.reviewedEvents)) {
      errors.rowErrorsById[row.clientId] = {
        ...errors.rowErrorsById[row.clientId],
        reviewedEvents: 'Reviewed events must be a non-negative number.',
      };
      continue;
    }

    totalReviewedEvents += Number(row.reviewedEvents);

    if (row.pollen === UNKNOWN_POLLEN_CODE) {
      unknownCount += 1;
    }
  }

  if (Array.from(pollenCounts.values()).some((count) => count > 1)) {
    errors.rows = 'Duplicate pollens are not allowed.';
  }

  if (unknownCount > 1) {
    errors.rows = 'Unknown can only appear once.';
  }

  if (
    values.detectedEvents !== null &&
    totalReviewedEvents !== values.detectedEvents
  ) {
    errors.rows = 'Reviewed events must exactly match detected events.';
  }

  return errors;
}
