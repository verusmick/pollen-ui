'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  DEFAULT_CORRECTION_FACTOR_FORM_VALUES,
  EMPTY_CORRECTION_FACTOR_FORM_ERRORS,
} from '../constants';
import type {
  CorrectionFactorFormDerivedState,
  CorrectionFactorFormErrors,
  CorrectionFactorFormValues,
  CorrectionFactorSelectablePollen,
} from '../types';
import {
  buildCorrectionFactorDerivedState,
  validateCorrectionFactorForm,
} from '../utils';

type TopLevelField =
  | 'location'
  | 'basePollen'
  | 'startDate'
  | 'endDate'
  | 'detectedEvents'
  | 'publishOnSave';

type ErrorField = Exclude<keyof CorrectionFactorFormErrors, 'rows' | 'rowErrorsById'>;

function createRowId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `cf-row-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function buildBaseRow(basePollen: string, reviewedEvents = '') {
  return {
    clientId: createRowId(),
    pollen: basePollen,
    reviewedEvents,
    isBasePollen: true,
  } as const;
}

function syncBaseRow(values: CorrectionFactorFormValues): CorrectionFactorFormValues {
  if (!values.basePollen) {
    return {
      ...values,
      rows: [],
    };
  }

  const baseRow = values.rows.find((row) => row.isBasePollen);
  const otherRows = values.rows.filter((row) => !row.isBasePollen);

  return {
    ...values,
    rows: [
      baseRow
        ? {
            ...baseRow,
            pollen: values.basePollen,
            isBasePollen: true,
          }
        : buildBaseRow(values.basePollen),
      ...otherRows,
    ],
  };
}

export function useCorrectionFactorForm() {
  const t = useTranslations('correctionFactorsPage.form.validation');
  const [values, setValues] = useState<CorrectionFactorFormValues>(
    DEFAULT_CORRECTION_FACTOR_FORM_VALUES
  );
  const [errors, setErrors] = useState<CorrectionFactorFormErrors>(
    EMPTY_CORRECTION_FACTOR_FORM_ERRORS
  );

  const derived = useMemo<CorrectionFactorFormDerivedState>(
    () => buildCorrectionFactorDerivedState(values, 'ratio'),
    [values]
  );

  function clearTopLevelError(field: ErrorField) {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      return {
        ...current,
        [field]: undefined,
      };
    });
  }

  function clearRowsError() {
    setErrors((current) => {
      if (!current.rows) {
        return current;
      }

      return {
        ...current,
        rows: undefined,
      };
    });
  }

  function clearRowError(
    clientId: string,
    field?: 'pollen' | 'reviewedEvents'
  ) {
    setErrors((current) => {
      const existingRowErrors = current.rowErrorsById[clientId];

      if (!existingRowErrors) {
        return current;
      }

      if (!field) {
        const nextRowErrorsById = { ...current.rowErrorsById };
        delete nextRowErrorsById[clientId];

        return {
          ...current,
          rowErrorsById: nextRowErrorsById,
        };
      }

      if (!existingRowErrors[field]) {
        return current;
      }

      const nextRowErrors = {
        ...existingRowErrors,
        [field]: undefined,
      };
      const nextRowErrorsById = { ...current.rowErrorsById };

      if (!nextRowErrors.pollen && !nextRowErrors.reviewedEvents) {
        delete nextRowErrorsById[clientId];
      } else {
        nextRowErrorsById[clientId] = nextRowErrors;
      }

      return {
        ...current,
        rowErrorsById: nextRowErrorsById,
      };
    });
  }

  function setField<K extends TopLevelField>(
    field: K,
    nextValue: CorrectionFactorFormValues[K]
  ) {
    setValues((current) => {
      const next = {
        ...current,
        [field]: nextValue,
      };

      if (field === 'basePollen') {
        return syncBaseRow(next);
      }

      return next;
    });

    if (
      field === 'location' ||
      field === 'basePollen' ||
      field === 'startDate' ||
      field === 'endDate' ||
      field === 'detectedEvents'
    ) {
      clearTopLevelError(field);
    }

    if (field === 'basePollen' || field === 'detectedEvents') {
      clearRowsError();
    }
  }

  function addRow() {
    setValues((current) => {
      if (!current.basePollen) {
        return current;
      }

      return {
        ...current,
        rows: [
          current.rows[0],
          ...current.rows.slice(1),
          {
            clientId: createRowId(),
            pollen: '',
            reviewedEvents: '',
            isBasePollen: false,
          },
        ],
      };
    });
    clearRowsError();
  }

  function removeRow(clientId: string) {
    setValues((current) => ({
      ...current,
      rows: current.rows.filter(
        (row) => row.clientId !== clientId || row.isBasePollen
      ),
    }));
    clearRowsError();
    clearRowError(clientId);
  }

  function updateRowPollen(
    clientId: string,
    pollen: CorrectionFactorSelectablePollen | ''
  ) {
    setValues((current) => ({
      ...current,
      rows: current.rows.map((row) =>
        row.clientId === clientId
          ? {
              ...row,
              pollen: row.isBasePollen ? current.basePollen : pollen,
            }
          : row
      ),
    }));
    clearRowsError();
    clearRowError(clientId, 'pollen');
  }

  function updateRowReviewedEvents(clientId: string, reviewedEvents: string) {
    setValues((current) => ({
      ...current,
      rows: current.rows.map((row) =>
        row.clientId === clientId
          ? {
              ...row,
              reviewedEvents,
            }
          : row
      ),
    }));
    clearRowsError();
    clearRowError(clientId, 'reviewedEvents');
  }

  function resetForm() {
    setValues(DEFAULT_CORRECTION_FACTOR_FORM_VALUES);
    setErrors(EMPTY_CORRECTION_FACTOR_FORM_ERRORS);
  }

  function replaceValues(nextValues: CorrectionFactorFormValues) {
    setValues(nextValues);
    setErrors(EMPTY_CORRECTION_FACTOR_FORM_ERRORS);
  }

  function validate() {
    const nextErrors = validateCorrectionFactorForm(values, {
      locationRequired: t('locationRequired'),
      basePollenRequired: t('basePollenRequired'),
      startDateRequired: t('startDateRequired'),
      endDateRequired: t('endDateRequired'),
      endDateOrder: t('endDateOrder'),
      detectedEventsRequired: t('detectedEventsRequired'),
      atLeastOneRow: t('atLeastOneRow'),
      exactlyOneBaseRow: t('exactlyOneBaseRow'),
      baseRowFirst: t('baseRowFirst'),
      baseRowMatch: t('baseRowMatch'),
      pollenRequired: t('pollenRequired'),
      reviewedEventsNonNegative: t('reviewedEventsNonNegative'),
      duplicatePollens: t('duplicatePollens'),
      overAllocated: t('overAllocated'),
    });
    setErrors(nextErrors);

    const hasTopLevelErrors = Object.entries(nextErrors).some(([key, value]) => {
      if (key === 'rowErrorsById') {
        return Object.keys(nextErrors.rowErrorsById).length > 0;
      }

      return Boolean(value);
    });

    return !hasTopLevelErrors;
  }

  function getPollenOptions(currentRowPollen: string, availablePollens: string[]): string[] {
    const selected = new Set(
      values.rows
        .filter((row) => row.pollen && row.pollen !== currentRowPollen)
        .map((row) => row.pollen)
    );
    return availablePollens.filter((pollen) => !selected.has(pollen));
  }

  return {
    values,
    errors,
    derived,
    setField,
    addRow,
    removeRow,
    updateRowPollen,
    updateRowReviewedEvents,
    resetForm,
    replaceValues,
    validate,
    getPollenOptions,
  };
}
