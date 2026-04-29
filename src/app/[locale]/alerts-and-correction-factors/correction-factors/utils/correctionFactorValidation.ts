import type {
  CorrectionFactorFormErrors,
  CorrectionFactorFormValues,
} from '../types';
import {
  compareCorrectionFactorDateTimes,
  isValidCorrectionFactorDateTime,
} from './correctionFactorDateTime';

interface CorrectionFactorValidationMessages {
  locationRequired: string;
  basePollenRequired: string;
  startDateRequired: string;
  endDateRequired: string;
  startDateInvalid: string;
  endDateInvalid: string;
  endDateOrder: string;
  detectedEventsRequired: string;
  atLeastOneRow: string;
  exactlyOneBaseRow: string;
  baseRowFirst: string;
  baseRowMatch: string;
  pollenRequired: string;
  reviewedEventsNonNegative: string;
  manualMultiplierRequired: string;
  manualMultiplierNonNegative: string;
  duplicatePollens: string;
  overAllocated: string;
}

export type CorrectionFactorValidationMessagesInput =
  CorrectionFactorValidationMessages;

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
  } else if (!isValidCorrectionFactorDateTime(values.startDate)) {
    errors.startDate = messages.startDateInvalid;
  }

  if (!values.endDate) {
    errors.endDate = messages.endDateRequired;
  } else if (!isValidCorrectionFactorDateTime(values.endDate)) {
    errors.endDate = messages.endDateInvalid;
  }

  const dateOrderComparison =
    values.startDate && values.endDate
      ? compareCorrectionFactorDateTimes(values.startDate, values.endDate)
      : null;

  if (dateOrderComparison !== null && dateOrderComparison > 0) {
    errors.endDate = messages.endDateOrder;
  }

  if (values.multiplierMode === 'eventBased' && values.detectedEvents === null) {
    errors.detectedEvents = messages.detectedEventsRequired;
  }

  if (values.multiplierMode === 'manual') {
    if (values.manualMultiplier.trim() === '') {
      errors.manualMultiplier = messages.manualMultiplierRequired;
    } else if (!isValidNonNegativeNumber(values.manualMultiplier)) {
      errors.manualMultiplier = messages.manualMultiplierNonNegative;
    }
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

export function hasCorrectionFactorFormErrors(
  errors: CorrectionFactorFormErrors
): boolean {
  return Object.entries(errors).some(([key, value]) => {
    if (key === 'rowErrorsById') {
      return Object.keys(errors.rowErrorsById).length > 0;
    }

    return Boolean(value);
  });
}

export function listCorrectionFactorFormErrors(
  errors: CorrectionFactorFormErrors
): string[] {
  const messages = new Set<string>();

  for (const key of [
    'location',
    'basePollen',
    'startDate',
    'endDate',
    'detectedEvents',
    'manualMultiplier',
    'rows',
  ] as const) {
    const value = errors[key];

    if (value) {
      messages.add(value);
    }
  }

  for (const rowErrors of Object.values(errors.rowErrorsById)) {
    if (rowErrors.pollen) {
      messages.add(rowErrors.pollen);
    }

    if (rowErrors.reviewedEvents) {
      messages.add(rowErrors.reviewedEvents);
    }
  }

  return Array.from(messages);
}
