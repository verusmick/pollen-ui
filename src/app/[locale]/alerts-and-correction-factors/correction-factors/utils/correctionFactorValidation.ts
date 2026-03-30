import type {
  CorrectionFactorFormErrors,
  CorrectionFactorFormValues,
} from '../types';

interface CorrectionFactorValidationMessages {
  locationRequired: string;
  basePollenRequired: string;
  startDateRequired: string;
  endDateRequired: string;
  endDateOrder: string;
  detectedEventsRequired: string;
  atLeastOneRow: string;
  exactlyOneBaseRow: string;
  baseRowFirst: string;
  baseRowMatch: string;
  pollenRequired: string;
  reviewedEventsNonNegative: string;
  duplicatePollens: string;
  overAllocated: string;
}

function isValidNonNegativeNumber(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

export function validateCorrectionFactorForm(
  values: CorrectionFactorFormValues,
  messages: CorrectionFactorValidationMessages
): CorrectionFactorFormErrors {
  const errors: CorrectionFactorFormErrors = {
    rowErrorsById: {},
  };

  if (!values.location) {
    errors.location = messages.locationRequired;
  }

  if (!values.basePollen) {
    errors.basePollen = messages.basePollenRequired;
  }

  if (!values.startDate) {
    errors.startDate = messages.startDateRequired;
  }

  if (!values.endDate) {
    errors.endDate = messages.endDateRequired;
  }

  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    errors.endDate = messages.endDateOrder;
  }

  if (values.detectedEvents === null) {
    errors.detectedEvents = messages.detectedEventsRequired;
  }

  if (values.rows.length === 0) {
    errors.rows = messages.atLeastOneRow;
    return errors;
  }

  const baseRows = values.rows.filter((row) => row.isBasePollen);
  if (baseRows.length !== 1) {
    errors.rows = messages.exactlyOneBaseRow;
  } else {
    const [baseRow] = baseRows;
    if (values.rows[0]?.clientId !== baseRow.clientId) {
      errors.rows = messages.baseRowFirst;
    }

    if (values.basePollen && baseRow.pollen !== values.basePollen) {
      errors.rows = messages.baseRowMatch;
    }
  }

  const pollenCounts = new Map<string, number>();
  let totalReviewedEvents = 0;

  for (const row of values.rows) {
    if (!row.pollen) {
      errors.rowErrorsById[row.clientId] = {
        ...errors.rowErrorsById[row.clientId],
        pollen: messages.pollenRequired,
      };
    } else {
      pollenCounts.set(row.pollen, (pollenCounts.get(row.pollen) ?? 0) + 1);
    }

    if (!isValidNonNegativeNumber(row.reviewedEvents)) {
      errors.rowErrorsById[row.clientId] = {
        ...errors.rowErrorsById[row.clientId],
        reviewedEvents: messages.reviewedEventsNonNegative,
      };
      continue;
    }

    totalReviewedEvents += Number(row.reviewedEvents);
  }

  if (Array.from(pollenCounts.values()).some((count) => count > 1)) {
    errors.rows = messages.duplicatePollens;
  }

  if (
    values.detectedEvents !== null &&
    totalReviewedEvents > values.detectedEvents
  ) {
    errors.rows = messages.overAllocated;
  }

  return errors;
}
