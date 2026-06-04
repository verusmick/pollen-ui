'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  DEFAULT_CORRECTION_FACTOR_FORM_VALUES,
  EMPTY_CORRECTION_FACTOR_FORM_ERRORS,
  UNKNOWN_POLLEN_CODE,
} from '../constants';
import type {
  CorrectionFactorChartNavigationState,
  CorrectionFactorChartRange,
  CorrectionFactorFormDerivedState,
  CorrectionFactorFormErrors,
  CorrectionFactorFormValues,
  CorrectionFactorMultiplierMode,
  CorrectionFactorPeak,
  CorrectionFactorReviewedValidationEvent,
  CorrectionFactorSelectablePollen,
  CorrectionFactorValidationEvent,
} from '../types';
import {
  buildCorrectionFactorDerivedState,
  didCorrectionFactorRangeChange,
  hasCorrectionFactorFormErrors,
  toMeasurementPreviewRange,
  validateCorrectionFactorForm,
} from '../utils';

type TopLevelField =
  | 'location'
  | 'basePollen'
  | 'ruleEnabled'
  | 'startDate'
  | 'endDate'
  | 'detectedEvents'
  | 'manualMultiplier';

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

function areReviewedValidationEventsEqual(
  left: CorrectionFactorReviewedValidationEvent[],
  right: CorrectionFactorReviewedValidationEvent[]
): boolean {
  return (
    left.length === right.length &&
    left.every((leftEvent, index) => {
      const rightEvent = right[index];

      return (
        rightEvent !== undefined &&
        leftEvent.id === rightEvent.id &&
        leftEvent.classification === rightEvent.classification &&
        leftEvent.datetime === rightEvent.datetime &&
        leftEvent.device === rightEvent.device &&
        leftEvent.imageUrl === rightEvent.imageUrl &&
        leftEvent.coordinates?.x === rightEvent.coordinates?.x &&
        leftEvent.coordinates?.y === rightEvent.coordinates?.y &&
        leftEvent.coordinates?.width === rightEvent.coordinates?.width &&
        leftEvent.coordinates?.height === rightEvent.coordinates?.height &&
        leftEvent.index === rightEvent.index &&
        leftEvent.reviewedPollen === rightEvent.reviewedPollen
      );
    })
  );
}

function withReviewedPollen(
  events: CorrectionFactorValidationEvent[],
  currentEvents: CorrectionFactorReviewedValidationEvent[]
): CorrectionFactorReviewedValidationEvent[] {
  const reviewedPollenById = new Map(
    currentEvents.map((event) => [event.id, event.reviewedPollen])
  );

  return [
    ...events.map((event) => ({
      ...event,
      reviewedPollen: reviewedPollenById.get(event.id) ?? UNKNOWN_POLLEN_CODE,
    })),
  ].sort((left, right) => left.datetime - right.datetime);
}

function buildAllowedPollenOptions(
  values: CorrectionFactorFormValues
): CorrectionFactorSelectablePollen[] {
  const allowedPollens = new Set<CorrectionFactorSelectablePollen>();

  if (values.basePollen) {
    allowedPollens.add(values.basePollen);
  }

  for (const row of values.rows) {
    if (row.pollen && row.pollen !== UNKNOWN_POLLEN_CODE) {
      allowedPollens.add(row.pollen);
    }
  }

  return Array.from(allowedPollens);
}

function syncRowsFromReviewedEvents(
  values: CorrectionFactorFormValues
): CorrectionFactorFormValues {
  if (!values.basePollen) {
    return {
      ...values,
      events: values.events.map((event) => ({
        ...event,
        reviewedPollen: UNKNOWN_POLLEN_CODE,
      })),
      rows: [],
    };
  }

  const allowedPollens = new Set(buildAllowedPollenOptions(values));
  const events = values.events.map((event) =>
    event.reviewedPollen === UNKNOWN_POLLEN_CODE ||
    allowedPollens.has(event.reviewedPollen)
      ? event
      : {
          ...event,
          reviewedPollen: UNKNOWN_POLLEN_CODE,
        }
  );
  const reviewedCounts = new Map<CorrectionFactorSelectablePollen, number>();

  for (const event of events) {
    if (event.reviewedPollen === UNKNOWN_POLLEN_CODE) {
      continue;
    }

    reviewedCounts.set(
      event.reviewedPollen,
      (reviewedCounts.get(event.reviewedPollen) ?? 0) + 1
    );
  }

  const baseRow = values.rows.find((row) => row.isBasePollen);
  const otherRows = values.rows.filter((row) => !row.isBasePollen);

  return {
    ...values,
    events,
    rows: [
      baseRow
        ? {
            ...baseRow,
            pollen: values.basePollen,
            reviewedEvents: String(reviewedCounts.get(values.basePollen) ?? 0),
            isBasePollen: true,
          }
        : buildBaseRow(
            values.basePollen,
            String(reviewedCounts.get(values.basePollen) ?? 0)
          ),
      ...otherRows.map((row) => ({
        ...row,
        reviewedEvents: row.pollen
          ? String(reviewedCounts.get(row.pollen) ?? 0)
          : '',
      })),
    ],
  };
}

function mergeRestoredReviewedEvents(
  currentEvents: CorrectionFactorReviewedValidationEvent[],
  restoredEvents: CorrectionFactorReviewedValidationEvent[],
  shouldRestoreExistingAssignments: boolean
): {
  events: CorrectionFactorReviewedValidationEvent[];
  changed: boolean;
} {
  const restoredEventsById = new Map(
    restoredEvents.map((event) => [event.id, event])
  );
  let changed = false;

  const nextEvents = currentEvents.map((event) => {
    const restoredEvent = restoredEventsById.get(event.id);

    if (!restoredEvent) {
      return event;
    }

    restoredEventsById.delete(event.id);

    if (!shouldRestoreExistingAssignments) {
      return event;
    }

    const nextEvent = {
      ...event,
      imageUrl: event.imageUrl || restoredEvent.imageUrl,
      coordinates: event.coordinates ?? restoredEvent.coordinates,
      index: event.index ?? restoredEvent.index,
      reviewedPollen: restoredEvent.reviewedPollen,
    };

    if (
      nextEvent.imageUrl !== event.imageUrl ||
      nextEvent.coordinates !== event.coordinates ||
      nextEvent.index !== event.index ||
      nextEvent.reviewedPollen !== event.reviewedPollen
    ) {
      changed = true;
    }

    return nextEvent;
  });
  const missingRestoredEvents = Array.from(restoredEventsById.values());

  if (missingRestoredEvents.length > 0) {
    changed = true;
  }

  return {
    events: [...nextEvents, ...missingRestoredEvents].sort(
      (left, right) => left.datetime - right.datetime
    ),
    changed,
  };
}

function clearStoredMultipliers(
  values: CorrectionFactorFormValues
): CorrectionFactorFormValues {
  return {
    ...values,
    rows: values.rows.map((row) =>
      row.storedMultiplier === undefined || row.storedMultiplier === null
        ? row
        : {
            ...row,
            storedMultiplier: null,
          }
    ),
  };
}

function clearSelectedReviewSlice(
  values: CorrectionFactorFormValues
): CorrectionFactorFormValues {
  if (values.selectedReviewSliceId === null) {
    return values;
  }

  return {
    ...values,
    selectedReviewSliceId: null,
  };
}

function clearReviewScopeData(
  values: CorrectionFactorFormValues
): CorrectionFactorFormValues {
  const valuesWithoutSelectedReviewSlice = clearSelectedReviewSlice(values);

  if (
    valuesWithoutSelectedReviewSlice.events.length === 0 &&
    valuesWithoutSelectedReviewSlice.peaks.length === 0
  ) {
    return valuesWithoutSelectedReviewSlice;
  }

  return {
    ...valuesWithoutSelectedReviewSlice,
    events: [],
    peaks: [],
  };
}

function buildInitialChartRangeStack(
  values: CorrectionFactorFormValues
): CorrectionFactorChartRange[] {
  const rootRange = toMeasurementPreviewRange(values.startDate, values.endDate);
  const selectedPeak = values.peaks.find(
    (peak) => peak.id === values.selectedReviewSliceId
  );

  if (!selectedPeak) {
    return rootRange ? [rootRange] : [];
  }

  const peakRange = {
    from: selectedPeak.startTimestamp,
    to: selectedPeak.endTimestamp,
  };

  if (!rootRange) {
    return [peakRange];
  }

  return [rootRange, peakRange];
}

export function useCorrectionFactorForm() {
  const t = useTranslations('correctionFactorsPage.form.validation');
  const [values, setValues] = useState<CorrectionFactorFormValues>(
    DEFAULT_CORRECTION_FACTOR_FORM_VALUES
  );
  const [errors, setErrors] = useState<CorrectionFactorFormErrors>(
    EMPTY_CORRECTION_FACTOR_FORM_ERRORS
  );
  const [hasValidated, setHasValidated] = useState(false);
  const [hasReviewSessionChanges, setHasReviewSessionChanges] = useState(false);
  const [chartRangeStack, setChartRangeStack] = useState<CorrectionFactorChartRange[]>(
    []
  );
  const rootChartRange = useMemo(
    () => toMeasurementPreviewRange(values.startDate, values.endDate),
    [values.endDate, values.startDate]
  );

  const derived = useMemo<CorrectionFactorFormDerivedState>(
    () => buildCorrectionFactorDerivedState(values, 'ratio'),
    [values]
  );
  const allowedPollenOptions = useMemo(
    () => buildAllowedPollenOptions(values),
    [values]
  );
  const validationMessages = useMemo(
    () => ({
      locationRequired: t('locationRequired'),
      basePollenRequired: t('basePollenRequired'),
      startDateRequired: t('startDateRequired'),
      endDateRequired: t('endDateRequired'),
      startDateInvalid: t('startDateInvalid'),
      endDateInvalid: t('endDateInvalid'),
      endDateOrder: t('endDateOrder'),
      detectedEventsRequired: t('detectedEventsRequired'),
      atLeastOneRow: t('atLeastOneRow'),
      exactlyOneBaseRow: t('exactlyOneBaseRow'),
      baseRowFirst: t('baseRowFirst'),
      baseRowMatch: t('baseRowMatch'),
      pollenRequired: t('pollenRequired'),
      reviewedEventsNonNegative: t('reviewedEventsNonNegative'),
      manualMultiplierRequired: t('manualMultiplierRequired'),
      manualMultiplierNonNegative: t('manualMultiplierNonNegative'),
      duplicatePollens: t('duplicatePollens'),
      overAllocated: t('overAllocated'),
    }),
    [t]
  );
  const validationErrors = useMemo(
    () => validateCorrectionFactorForm(values, validationMessages),
    [validationMessages, values]
  );
  const isValid = !hasCorrectionFactorFormErrors(validationErrors);
  const chartNavigation = useMemo<CorrectionFactorChartNavigationState>(() => {
    const visibleRange =
      chartRangeStack[chartRangeStack.length - 1] ?? rootChartRange ?? null;

    return {
      rootRange: rootChartRange,
      visibleRange,
      canDrillUp: chartRangeStack.length > 1,
      depth: chartRangeStack.length,
    };
  }, [chartRangeStack, rootChartRange]);

  useEffect(() => {
    if (!hasValidated) {
      return;
    }

    setErrors(validationErrors);
  }, [hasValidated, validationErrors]);

  useEffect(() => {
    if (!rootChartRange) {
      setChartRangeStack((current) => (current.length === 0 ? current : []));
      return;
    }

    setChartRangeStack((current) => {
      const currentRoot = current[0] ?? null;

      if (!didCorrectionFactorRangeChange(currentRoot, rootChartRange) && current.length > 0) {
        return current;
      }

      return [rootChartRange];
    });
  }, [rootChartRange]);

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

      if (
        field === 'location' ||
        field === 'basePollen' ||
        field === 'startDate' ||
        field === 'endDate'
      ) {
        const nextWithoutReviewScopeData = clearReviewScopeData(next);

        if (field === 'basePollen') {
          return syncRowsFromReviewedEvents(
            syncBaseRow(nextWithoutReviewScopeData)
          );
        }

        return nextWithoutReviewScopeData;
      }

      return next;
    });

    if (
      field === 'location' ||
      field === 'basePollen' ||
      field === 'startDate' ||
      field === 'endDate'
    ) {
      setHasReviewSessionChanges(false);
      setChartRangeStack([]);
    }

    if (
      field === 'location' ||
      field === 'basePollen' ||
      field === 'startDate' ||
      field === 'endDate' ||
      field === 'detectedEvents' ||
      field === 'manualMultiplier'
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

      return syncRowsFromReviewedEvents({
        ...current,
        rows: [
          current.rows[0],
          ...current.rows.slice(1),
          {
            clientId: createRowId(),
            pollen: '',
            reviewedEvents: '',
            storedMultiplier: null,
            isBasePollen: false,
          },
        ],
      });
    });
    clearRowsError();
  }

  function removeRow(clientId: string) {
    setValues((current) =>
      syncRowsFromReviewedEvents({
        ...current,
        rows: current.rows.filter(
          (row) => row.clientId !== clientId || row.isBasePollen
        ),
      })
    );
    clearRowsError();
    clearRowError(clientId);
  }

  function updateRowPollen(
    clientId: string,
    pollen: CorrectionFactorSelectablePollen | ''
  ) {
    setValues((current) =>
      syncRowsFromReviewedEvents({
        ...current,
        rows: current.rows.map((row) =>
          row.clientId === clientId
            ? {
                ...row,
                pollen: row.isBasePollen ? current.basePollen : pollen,
              }
            : row
        ),
      })
    );
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

  function replaceValidationEvents(
    events: CorrectionFactorValidationEvent[],
    options: { syncRows?: boolean } = {}
  ) {
    const syncRows = options.syncRows ?? true;

    if (events.length === 0) {
      setHasReviewSessionChanges(false);
    }

    setValues((current) => {
      if (events.length === 0) {
        if (current.events.length === 0) {
          return current;
        }

        const next = {
          ...current,
          events: [],
        };

        return syncRows ? syncRowsFromReviewedEvents(next) : next;
      }

      const nextEvents = withReviewedPollen(events, current.events);

      if (areReviewedValidationEventsEqual(current.events, nextEvents)) {
        return current;
      }

      const next = {
        ...current,
        events: nextEvents,
      };

      return syncRows ? syncRowsFromReviewedEvents(next) : next;
    });
  }

  function restoreReviewedEvents(
    restoredEvents: CorrectionFactorReviewedValidationEvent[]
  ) {
    if (restoredEvents.length === 0) {
      return;
    }

    setValues((current) => {
      if (!current.basePollen) {
        return current;
      }

      const { events, changed } = mergeRestoredReviewedEvents(
        current.events,
        restoredEvents,
        !hasReviewSessionChanges
      );

      if (!changed) {
        return current;
      }

      return syncRowsFromReviewedEvents({
        ...current,
        events,
      });
    });
  }

  function updateEventReviewedPollen(
    eventId: string,
    reviewedPollen: CorrectionFactorSelectablePollen
  ) {
    setValues((current) => {
      const allowedPollens = new Set(buildAllowedPollenOptions(current));
      const nextReviewedPollen =
        reviewedPollen === UNKNOWN_POLLEN_CODE ||
        allowedPollens.has(reviewedPollen)
          ? reviewedPollen
          : UNKNOWN_POLLEN_CODE;
      let changed = false;
      const nextEvents = current.events.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        if (event.reviewedPollen === nextReviewedPollen) {
          return event;
        }

        changed = true;
        return {
          ...event,
          reviewedPollen: nextReviewedPollen,
        };
      });

      if (!changed) {
        return current;
      }

      return syncRowsFromReviewedEvents(
        clearStoredMultipliers({
          ...current,
          reviewStateSource: 'active',
          events: nextEvents,
        })
      );
    });
    setHasReviewSessionChanges(true);
    clearRowsError();
  }

  function toggleEventAccepted(eventId: string) {
    setValues((current) => {
      if (!current.basePollen) {
        return current;
      }

      let changed = false;
      const nextEvents = current.events.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        const nextReviewedPollen =
          event.reviewedPollen === current.basePollen
            ? UNKNOWN_POLLEN_CODE
            : current.basePollen;

        if (event.reviewedPollen === nextReviewedPollen) {
          return event;
        }

        changed = true;

        return {
          ...event,
          reviewedPollen: nextReviewedPollen,
        };
      });

      if (!changed) {
        return current;
      }

      return syncRowsFromReviewedEvents(
        clearStoredMultipliers({
          ...current,
          reviewStateSource: 'active',
          events: nextEvents,
        })
      );
    });
    setHasReviewSessionChanges(true);
    clearRowsError();
  }

  function setSelectedReviewSliceId(selectedReviewSliceId: string | null) {
    setHasReviewSessionChanges(false);
    setValues((current) => {
      if (current.selectedReviewSliceId === selectedReviewSliceId) {
        return current;
      }

      return {
        ...current,
        selectedReviewSliceId,
      };
    });
  }

  function setSelectedReviewPeak(peak: CorrectionFactorPeak) {
    setValues((current) => {
      const existingPeak = current.peaks.find(
        (candidate) => candidate.id === peak.id
      );

      if (
        existingPeak &&
        existingPeak.pollen === peak.pollen &&
        existingPeak.location === peak.location &&
        existingPeak.startDate === peak.startDate &&
        existingPeak.endDate === peak.endDate &&
        existingPeak.value === peak.value
      ) {
        return current;
      }

      return {
        ...current,
        peaks: existingPeak
          ? current.peaks.map((candidate) =>
              candidate.id === peak.id
                ? {
                    ...peak,
                    images: candidate.images,
                  }
                : candidate
            )
          : [...current.peaks, peak],
      };
    });
  }

  function setMultiplierMode(multiplierMode: CorrectionFactorMultiplierMode) {
    if (multiplierMode === 'manual') {
      setHasReviewSessionChanges(true);
    }

    setValues((current) => {
      if (current.multiplierMode === multiplierMode) {
        return current;
      }

      if (multiplierMode === 'manual' && current.manualMultiplier.trim() === '') {
        const currentDerived = buildCorrectionFactorDerivedState(current, 'ratio');
        const storedBaseMultiplier =
          current.rows.find((row) => row.isBasePollen)?.storedMultiplier ?? null;
        const baseMultiplier =
          storedBaseMultiplier ??
          currentDerived.rows.find((row) => row.isBasePollen && !row.isSyntheticUnknown)
            ?.multiplier ??
          0;

        return {
          ...current,
          multiplierMode,
          reviewStateSource: 'active',
          manualMultiplier: String(baseMultiplier),
        };
      }

      return {
        ...current,
        multiplierMode,
        reviewStateSource:
          multiplierMode === 'manual' ? 'active' : current.reviewStateSource,
      };
    });
    clearTopLevelError('manualMultiplier');
  }

  function updateManualMultiplier(manualMultiplier: string) {
    setHasReviewSessionChanges(true);
    setField('manualMultiplier', manualMultiplier);
  }

  function drillDownToRange(nextRange: CorrectionFactorChartRange) {
    setHasReviewSessionChanges(false);
    setValues((current) => clearSelectedReviewSlice(current));
    setChartRangeStack((current) => {
      if (current.length === 0) {
        return rootChartRange ? [rootChartRange, nextRange] : [nextRange];
      }

      const currentRange = current[current.length - 1] ?? null;

      if (!didCorrectionFactorRangeChange(currentRange, nextRange)) {
        return current;
      }

      return [...current, nextRange];
    });
  }

  function drillUpChartRange() {
    setHasReviewSessionChanges(false);
    setValues((current) => clearSelectedReviewSlice(current));
    setChartRangeStack((current) =>
      current.length > 1 ? current.slice(0, -1) : current
    );
  }

  function resetForm() {
    setValues(DEFAULT_CORRECTION_FACTOR_FORM_VALUES);
    setChartRangeStack([]);
    setHasReviewSessionChanges(false);
    setHasValidated(false);
    setErrors(EMPTY_CORRECTION_FACTOR_FORM_ERRORS);
  }

  function replaceValues(nextValues: CorrectionFactorFormValues) {
    setValues(nextValues);
    setChartRangeStack(buildInitialChartRangeStack(nextValues));
    setHasReviewSessionChanges(false);
    setHasValidated(false);
    setErrors(EMPTY_CORRECTION_FACTOR_FORM_ERRORS);
  }

  function validate() {
    setHasValidated(true);
    setErrors(validationErrors);

    return isValid;
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
    chartNavigation,
    allowedPollenOptions,
    hasReviewSessionChanges,
    hasValidated,
    isValid,
    validationErrors,
    setField,
    addRow,
    removeRow,
    updateRowPollen,
    updateRowReviewedEvents,
    replaceValidationEvents,
    restoreReviewedEvents,
    updateEventReviewedPollen,
    toggleEventAccepted,
    setSelectedReviewSliceId,
    setSelectedReviewPeak,
    setMultiplierMode,
    updateManualMultiplier,
    drillDownToRange,
    drillUpChartRange,
    resetForm,
    replaceValues,
    validate,
    getPollenOptions,
  };
}
