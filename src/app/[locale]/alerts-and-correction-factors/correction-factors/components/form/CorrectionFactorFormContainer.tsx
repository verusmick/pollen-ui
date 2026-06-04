'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/features/i18n/routing';
import {
  createCorrectionFactor,
  deleteCorrectionFactor,
  getCorrectionFactorLocations,
  getCorrectionFactorPollens,
  updateCorrectionFactor,
} from '@/lib/api/correctionFactors';
import { correctionFactorKeys } from '../../constants';
import type { CorrectionFactorFormMode } from '../../types';
import {
  useCorrectionFactorDetail,
  useCorrectionFactorForm,
  useCorrectionFactorPreview,
  useCorrectionFactorValidationEvents,
} from '../../hooks';
import {
  buildCorrectionFactorWritePayload,
  mapCorrectionFactorRecordToFormValues,
  mapPeakImageToReviewedValidationEvent,
  toCorrectionFactorApiDateTimeFromUnixTimestamp,
  toCorrectionFactorUserFacingError,
} from '../../utils';
import { formatPollenScienceTimeRange } from '../../../utils/pollenScienceDateTime';
import { CorrectionFactorForm } from './CorrectionFactorForm';

interface CorrectionFactorFormContainerProps {
  mode?: CorrectionFactorFormMode;
  correctionFactorId?: string;
}

function formatPersistedPeakLabel(
  startTimestamp: number,
  endTimestamp: number
): string {
  return formatPollenScienceTimeRange(startTimestamp, endTimestamp);
}

export function CorrectionFactorFormContainer({
  mode = 'create',
  correctionFactorId,
}: CorrectionFactorFormContainerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('correctionFactorsPage.form');
  const listHref = '/alerts-and-correction-factors/correction-factors';
  const isEditMode = mode === 'edit';
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reviewWorkspaceOpen, setReviewWorkspaceOpen] = useState(false);
  const hydratedRecordIdRef = useRef<string | null>(null);
  const pendingAutoOpenSliceIdRef = useRef<string | null>(null);
  const previousSelectedSliceIdRef = useRef<string | null>(null);
  const form = useCorrectionFactorForm();
  const isManualOverrideMode = form.values.multiplierMode === 'manual';
  const detailQuery = useCorrectionFactorDetail(
    isEditMode ? correctionFactorId : undefined
  );

  const {
    data: locationOptions = [],
    isLoading: locationsLoading,
    isError: locationsError,
    error: locationsQueryError,
  } = useQuery({
    queryKey: correctionFactorKeys.locations(),
    queryFn: getCorrectionFactorLocations,
    staleTime: 1000 * 60 * 10,
  });

  const {
    data: pollenOptions = [],
    isLoading: pollensLoading,
    isError: pollensError,
    error: pollensQueryError,
  } = useQuery({
    queryKey: correctionFactorKeys.pollens(),
    queryFn: getCorrectionFactorPollens,
    staleTime: 1000 * 60 * 10,
  });
  const validationLocationOption =
    locationOptions.find((option) => option.id === form.values.location) ?? null;
  const validationLocation =
    validationLocationOption?.validationName ??
    validationLocationOption?.name ??
    validationLocationOption?.id ??
    '';
  const validationLocationMappingError =
    form.values.location &&
    !locationsLoading &&
    !locationsError &&
    (!validationLocationOption || !validationLocation)
      ? t('meta.detectedEventsLocationMappingError', {
          location: form.values.location,
        })
      : null;
  const preview = useCorrectionFactorPreview({
    values: form.values,
    derived: form.derived,
    visibleRange: form.chartNavigation.visibleRange,
  });
  const selectedPersistedPeak = useMemo(
    () =>
      form.values.selectedReviewSliceId
        ? (form.values.peaks.find(
            (peak) => peak.id === form.values.selectedReviewSliceId
          ) ?? null)
        : null,
    [form.values.peaks, form.values.selectedReviewSliceId]
  );
  const selectedPreviewSlice = useMemo(() => {
    if (!form.values.selectedReviewSliceId) {
      return null;
    }

    const point =
      preview.series?.points.find(
        (candidate) =>
          candidate.id === form.values.selectedReviewSliceId &&
          candidate.isReviewSlice
      ) ?? null;

    if (point) {
      return {
        id: point.id,
        from: point.timestamp,
        to: point.endTimestamp,
        label: point.label,
        value: point.originalValue,
      };
    }

    const slice =
      preview.reviewSlices.find(
        (candidate) => candidate.id === form.values.selectedReviewSliceId
      ) ?? null;

    if (slice) {
      return {
        id: slice.id,
        from: slice.from,
        to: slice.to,
        label: slice.label,
        value: null,
      };
    }

    if (selectedPersistedPeak) {
      return {
        id: selectedPersistedPeak.id,
        from: selectedPersistedPeak.startTimestamp,
        to: selectedPersistedPeak.endTimestamp,
        label: formatPersistedPeakLabel(
          selectedPersistedPeak.startTimestamp,
          selectedPersistedPeak.endTimestamp
        ),
        value: selectedPersistedPeak.value,
      };
    }

    return null;
  }, [
    form.values.selectedReviewSliceId,
    preview.reviewSlices,
    preview.series,
    selectedPersistedPeak,
  ]);
  const hasSelectedPreviewSlice = selectedPreviewSlice !== null;
  const hasRestoredSelectedPeakImages =
    selectedPersistedPeak !== null && selectedPersistedPeak.images.length > 0;
  const restoredSelectedPeakEvents = useMemo(
    () =>
      selectedPersistedPeak && form.values.basePollen
        ? selectedPersistedPeak.images.map((image) =>
            mapPeakImageToReviewedValidationEvent(image, form.values.basePollen)
          )
        : [],
    [form.values.basePollen, selectedPersistedPeak]
  );
  const hasRestoredSelectedEvents = restoredSelectedPeakEvents.length > 0;
  const restoredAcceptedEventIds = useMemo(
    () =>
      restoredSelectedPeakEvents
        .map((event) => event.id)
        .filter((eventId) => {
          const currentEvent = form.values.events.find(
            (event) => event.id === eventId
          );

          return (
            !currentEvent || currentEvent.reviewedPollen === form.values.basePollen
          );
        }),
    [form.values.basePollen, form.values.events, restoredSelectedPeakEvents]
  );
  const previewReviewSlices = useMemo(() => {
    if (
      !selectedPersistedPeak ||
      preview.reviewSlices.some((slice) => slice.id === selectedPersistedPeak.id)
    ) {
      return preview.reviewSlices;
    }

    return [
      {
        id: selectedPersistedPeak.id,
        from: selectedPersistedPeak.startTimestamp,
        to: selectedPersistedPeak.endTimestamp,
        peakTimestamp: selectedPersistedPeak.startTimestamp,
        label: formatPersistedPeakLabel(
          selectedPersistedPeak.startTimestamp,
          selectedPersistedPeak.endTimestamp
        ),
      },
      ...preview.reviewSlices,
    ];
  }, [preview.reviewSlices, selectedPersistedPeak]);
  const selectedPreviewSliceId = selectedPreviewSlice?.id ?? null;
  const selectedPreviewSliceFrom = selectedPreviewSlice?.from ?? null;
  const selectedPreviewSliceTo = selectedPreviewSlice?.to ?? null;
  const validationEvents = useCorrectionFactorValidationEvents({
    location: validationLocation,
    basePollen: form.values.basePollen,
    selectedReviewSliceId: isManualOverrideMode ? null : selectedPreviewSliceId,
    selectedReviewSliceFrom: isManualOverrideMode ? null : selectedPreviewSliceFrom,
    selectedReviewSliceTo: isManualOverrideMode ? null : selectedPreviewSliceTo,
  });
  const hydratedFormValues = useMemo(
    () =>
      detailQuery.data
        ? mapCorrectionFactorRecordToFormValues(detailQuery.data)
        : null,
    [detailQuery.data]
  );

  useEffect(() => {
    form.resetForm();
    setActionError(null);
    setReviewWorkspaceOpen(false);
    hydratedRecordIdRef.current = null;
  }, [correctionFactorId, mode]);

  useEffect(() => {
    if (!isEditMode || !detailQuery.data) {
      return;
    }

    if (hydratedRecordIdRef.current === detailQuery.data.id) {
      return;
    }

    if (!hydratedFormValues) {
      return;
    }

    form.replaceValues(hydratedFormValues);
    hydratedRecordIdRef.current = detailQuery.data.id;
  }, [detailQuery.data, form, hydratedFormValues, isEditMode]);

  useEffect(() => {
    if (!form.values.selectedReviewSliceId) {
      pendingAutoOpenSliceIdRef.current = null;
      previousSelectedSliceIdRef.current = null;
      setReviewWorkspaceOpen(false);
      return;
    }

    if (
      previousSelectedSliceIdRef.current !== form.values.selectedReviewSliceId
    ) {
      pendingAutoOpenSliceIdRef.current =
        isManualOverrideMode || (isEditMode && selectedPersistedPeak)
          ? null
          : form.values.selectedReviewSliceId;
      previousSelectedSliceIdRef.current = form.values.selectedReviewSliceId;
    }

    if (selectedPreviewSlice) {
      return;
    }

    pendingAutoOpenSliceIdRef.current = null;
    form.setSelectedReviewSliceId(null);
  }, [
    form,
    form.values.selectedReviewSliceId,
    isEditMode,
    isManualOverrideMode,
    selectedPersistedPeak,
    selectedPreviewSlice,
  ]);

  useEffect(() => {
    if (!isManualOverrideMode) {
      return;
    }

    pendingAutoOpenSliceIdRef.current = null;
    setReviewWorkspaceOpen(false);
  }, [isManualOverrideMode]);

  useEffect(() => {
    if (
      !selectedPreviewSlice ||
      selectedPreviewSlice.value === null ||
      !form.values.basePollen ||
      !form.values.location
    ) {
      return;
    }

    const startDate = toCorrectionFactorApiDateTimeFromUnixTimestamp(
      selectedPreviewSlice.from
    );
    const endDate = toCorrectionFactorApiDateTimeFromUnixTimestamp(
      selectedPreviewSlice.to
    );

    if (!startDate || !endDate) {
      return;
    }

    form.setSelectedReviewPeak({
      id: selectedPreviewSlice.id,
      pollen: form.values.basePollen,
      location: form.values.location,
      startDate,
      endDate,
      startTimestamp: selectedPreviewSlice.from,
      endTimestamp: selectedPreviewSlice.to,
      value: selectedPreviewSlice.value,
      images: [],
    });
  }, [
    form,
    form.values.basePollen,
    form.values.location,
    selectedPreviewSlice,
  ]);

  useEffect(() => {
    const pendingSliceId = pendingAutoOpenSliceIdRef.current;

    if (!pendingSliceId || pendingSliceId !== selectedPreviewSliceId) {
      return;
    }

    if (
      validationEvents.status === 'ready' &&
      validationEvents.detectedEvents !== null &&
      validationEvents.detectedEvents > 0
    ) {
      setReviewWorkspaceOpen(true);
      pendingAutoOpenSliceIdRef.current = null;
      return;
    }

    if (
      validationEvents.status === 'empty' ||
      validationEvents.status === 'error' ||
      !selectedPreviewSliceId
    ) {
      pendingAutoOpenSliceIdRef.current = null;
    }
  }, [
    selectedPreviewSliceId,
    validationEvents.detectedEvents,
    validationEvents.status,
  ]);

  useEffect(() => {
    if (isManualOverrideMode) {
      return;
    }

    if (validationEvents.status === 'ready') {
      form.replaceValidationEvents(validationEvents.events, {
        syncRows:
          !isEditMode ||
          form.values.reviewStateSource === 'active' ||
          hasRestoredSelectedPeakImages,
      });

      const detectedEvents = Math.max(
        validationEvents.detectedEvents ?? 0,
        validationEvents.events.length
      );

      if (form.values.detectedEvents !== detectedEvents) {
        form.setField('detectedEvents', detectedEvents);
      }

      return;
    }

    if (validationEvents.status === 'empty' && hasRestoredSelectedEvents) {
      return;
    }

    if (validationEvents.status === 'empty') {
      form.replaceValidationEvents([], {
        syncRows: !isEditMode || form.values.reviewStateSource === 'active',
      });

      if (form.values.detectedEvents !== validationEvents.detectedEvents) {
        form.setField('detectedEvents', validationEvents.detectedEvents);
      }

      return;
    }

    if (hasRestoredSelectedEvents) {
      return;
    }

    form.replaceValidationEvents([], {
      syncRows: !isEditMode || form.values.reviewStateSource === 'active',
    });

    if (form.values.detectedEvents !== null) {
      form.setField('detectedEvents', null);
    }
  }, [
    form,
    form.values.reviewStateSource,
    hasRestoredSelectedEvents,
    hasRestoredSelectedPeakImages,
    isManualOverrideMode,
    validationEvents.detectedEvents,
    validationEvents.events,
    validationEvents.status,
  ]);

  useEffect(() => {
    if (!isEditMode || restoredSelectedPeakEvents.length === 0) {
      return;
    }

    form.restoreReviewedEvents(restoredSelectedPeakEvents);
  }, [form, isEditMode, restoredSelectedPeakEvents]);

  const detailError =
    isEditMode && detailQuery.isError ? t('states.loadError') : null;
  const hydratedRuleEnabled = detailQuery.data?.details[0]?.published ?? false;
  const isStoredRecordOtherwiseUnchanged =
    hydratedFormValues !== null &&
    form.values.location === hydratedFormValues.location &&
    form.values.basePollen === hydratedFormValues.basePollen &&
    form.values.startDate === hydratedFormValues.startDate &&
    form.values.endDate === hydratedFormValues.endDate &&
    form.values.multiplierMode === hydratedFormValues.multiplierMode &&
    form.values.manualMultiplier === hydratedFormValues.manualMultiplier &&
    form.values.rows.length === hydratedFormValues.rows.length &&
    form.values.rows.every((row, index) => {
      const hydratedRow = hydratedFormValues.rows[index];

      return (
        hydratedRow !== undefined &&
        row.pollen === hydratedRow.pollen &&
        row.reviewedEvents === hydratedRow.reviewedEvents &&
        row.storedMultiplier === hydratedRow.storedMultiplier &&
        row.isBasePollen === hydratedRow.isBasePollen
      );
    });
  const showStoredMultiplierView =
    isEditMode &&
    form.values.reviewStateSource === 'persisted' &&
    !form.hasReviewSessionChanges &&
    isStoredRecordOtherwiseUnchanged;
  const hasRuleEnabledChanged =
    isEditMode &&
    Boolean(detailQuery.data) &&
    form.values.ruleEnabled !== hydratedRuleEnabled;
  const canSaveRuleEnabledChange =
    showStoredMultiplierView &&
    hasRuleEnabledChanged &&
    isStoredRecordOtherwiseUnchanged &&
    Boolean(correctionFactorId) &&
    !detailQuery.isLoading &&
    !detailError;
  const submitDisabled =
    saving ||
    deleting ||
    (!form.isValid && !canSaveRuleEnabledChange) ||
    (isEditMode &&
      (!correctionFactorId ||
        detailQuery.isLoading ||
        Boolean(detailError)));
  const deleteDisabled =
    deleting ||
    saving ||
    !correctionFactorId ||
    detailQuery.isLoading ||
    Boolean(detailError);
  const locationOptionsError = locationsError
    ? toCorrectionFactorUserFacingError(locationsQueryError, {
        fallbackMessage: t('meta.optionsLoadError'),
      })
    : null;
  const pollenOptionsError = pollensError
    ? toCorrectionFactorUserFacingError(pollensQueryError, {
        fallbackMessage: t('meta.optionsLoadError'),
      })
    : null;
  const isDateRangeSelectionComplete = Boolean(form.values.location) &&
    Boolean(form.values.basePollen) &&
    Boolean(form.values.startDate) &&
    Boolean(form.values.endDate);
  const validationEventsStatusText = validationLocationMappingError
    ? null
    : hasRestoredSelectedEvents
      ? t('meta.detectedEventsLoaded')
    : !isDateRangeSelectionComplete
      ? t('meta.detectedEventsHint')
      : !hasSelectedPreviewSlice
        ? t('meta.detectedEventsSelectSlice')
        : validationEvents.status === 'loading'
          ? t('meta.detectedEventsLoading')
          : validationEvents.status === 'ready' || validationEvents.status === 'empty'
            ? t('meta.detectedEventsLoaded')
            : null;
  const validationEventsError = validationLocationMappingError
    ? hasRestoredSelectedEvents
      ? null
      : validationLocationMappingError
    : validationEvents.status === 'error'
      ? toCorrectionFactorUserFacingError(validationEvents.error, {
          fallbackMessage: t('meta.detectedEventsError'),
          mismatchMessage: t('meta.detectedEventsMismatchError'),
        })
      : null;
  const carouselValidationStatus = validationLocationMappingError
    ? hasRestoredSelectedEvents
      ? 'ready'
      : 'error'
    : hasRestoredSelectedEvents
      ? 'ready'
    : validationEvents.status;
  const carouselIdleMessage =
    isDateRangeSelectionComplete && !hasSelectedPreviewSlice
    ? t('eventsCarousel.selectSlice')
    : null;
  const carouselValidationError = validationLocationMappingError
    ? validationLocationMappingError
    : validationEvents.status === 'error'
      ? toCorrectionFactorUserFacingError(validationEvents.error, {
          fallbackMessage: t('eventsCarousel.error'),
          mismatchMessage: t('eventsCarousel.errorMismatch'),
        })
      : null;
  const previewError =
    preview.status === 'error'
      ? toCorrectionFactorUserFacingError(preview.error, {
          fallbackMessage: t('preview.error'),
        })
      : null;

  function handleSelectReviewSlice(sliceId: string) {
    form.setSelectedReviewSliceId(sliceId);

    if (isManualOverrideMode) {
      setReviewWorkspaceOpen(false);
      return;
    }

    setReviewWorkspaceOpen(true);
  }

  function handleActivatePreviewBucket(bucketId: string) {
    const bucket =
      preview.series?.points.find((candidate) => candidate.id === bucketId) ?? null;

    if (!bucket) {
      return;
    }

    if (bucket.isReviewSlice) {
      handleSelectReviewSlice(bucket.id);
      return;
    }

    form.drillDownToRange({
      from: bucket.timestamp,
      to: bucket.endTimestamp,
    });
  }

  async function refreshCorrectionFactorQueries(id?: string) {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: correctionFactorKeys.lists(),
      }),
      queryClient.invalidateQueries({
        queryKey: correctionFactorKeys.details(),
      }),
      id
        ? queryClient.invalidateQueries({
            queryKey: correctionFactorKeys.detail(id),
          })
        : Promise.resolve(),
    ]);

    queryClient.removeQueries({
      queryKey: correctionFactorKeys.lists(),
      type: 'inactive',
    });
    queryClient.removeQueries({
      queryKey: correctionFactorKeys.previews(),
      type: 'inactive',
    });
    queryClient.removeQueries({
      queryKey: correctionFactorKeys.validationEvents(),
      type: 'inactive',
    });
    if (id) {
      queryClient.removeQueries({
        queryKey: correctionFactorKeys.detail(id),
        type: 'inactive',
      });
    }
  }

  async function handleSubmit() {
    setActionError(null);

    if (!canSaveRuleEnabledChange && !form.isValid) {
      form.validate();
      return;
    }

    if (submitDisabled) {
      return;
    }

    if (!canSaveRuleEnabledChange && !form.validate()) {
      return;
    }

    try {
      setSaving(true);

      const payload = buildCorrectionFactorWritePayload(form.values, {
        // TODO: Confirm backend factor_percentage scale before enabling edit parity.
        factorPercentageScale: 'ratio',
        preferStoredMultipliers: showStoredMultiplierView,
      });

      if (isEditMode && correctionFactorId) {
        const response = await updateCorrectionFactor(correctionFactorId, payload);
        const nextId = String(response.data.id);

        await refreshCorrectionFactorQueries(nextId);
      } else {
        const response = await createCorrectionFactor(payload);
        const nextId = String(response.data.id);

        await refreshCorrectionFactorQueries(nextId);
      }

      router.replace(listHref);
    } catch (error) {
      setActionError(
        toCorrectionFactorUserFacingError(error, {
          fallbackMessage: isEditMode
            ? t('updateErrorFallback')
            : t('submitErrorFallback'),
        })
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isEditMode || !correctionFactorId || deleteDisabled) {
      return;
    }

    setActionError(null);

    if (!window.confirm(t('actions.deleteConfirm'))) {
      return;
    }

    try {
      setDeleting(true);
      await deleteCorrectionFactor(correctionFactorId);
      await refreshCorrectionFactorQueries(correctionFactorId);
      queryClient.removeQueries({
        queryKey: correctionFactorKeys.detail(correctionFactorId),
      });
      router.replace(listHref);
    } catch (error) {
      setActionError(
        toCorrectionFactorUserFacingError(error, {
          fallbackMessage: t('deleteErrorFallback'),
        })
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <CorrectionFactorForm
      mode={mode}
      values={form.values}
      errors={form.errors}
      validationErrors={form.validationErrors}
      hasValidated={form.hasValidated}
      isFormValid={form.isValid}
      derived={form.derived}
      locationOptions={locationOptions}
      pollenOptions={pollenOptions}
      locationsLoading={locationsLoading}
      pollensLoading={pollensLoading}
      locationsError={locationOptionsError}
      pollensError={pollenOptionsError}
      validationEventsStatus={carouselValidationStatus}
      validationEvents={form.values.events}
      validationAcceptedEventIds={restoredAcceptedEventIds}
      validationEventsIdleMessage={carouselIdleMessage}
      validationEventsError={carouselValidationError}
      validationEventsStatusText={validationEventsStatusText}
      validationEventsFieldError={validationEventsError}
      validationEventsDisabledReason={
        isManualOverrideMode ? t('distribution.manualActiveNotice') : null
      }
      onToggleValidationEventAccepted={
        isManualOverrideMode ? () => undefined : form.toggleEventAccepted
      }
      reviewWorkspaceOpen={reviewWorkspaceOpen}
      onOpenReviewWorkspace={() => {
        if (!isManualOverrideMode) {
          setReviewWorkspaceOpen(true);
        }
      }}
      onCloseReviewWorkspace={() => setReviewWorkspaceOpen(false)}
      onSelectReviewSlice={handleSelectReviewSlice}
      onMultiplierModeChange={form.setMultiplierMode}
      onManualMultiplierChange={form.updateManualMultiplier}
      saving={saving}
      deleting={deleting}
      actionError={actionError}
      detailLoading={isEditMode ? detailQuery.isLoading : false}
      detailError={detailError}
      editHydrationBlocked={false}
      editHydrationMessage={null}
      detailRecord={detailQuery.data ?? null}
      submitDisabled={submitDisabled}
      deleteDisabled={deleteDisabled}
      canDelete={isEditMode}
      showStoredMultiplierView={showStoredMultiplierView}
      basePollen={form.values.basePollen}
      previewStatus={preview.status}
      previewSeries={preview.series}
      previewReviewSlices={previewReviewSlices}
      selectedPreviewSliceId={form.values.selectedReviewSliceId}
      previewVisibleRange={form.chartNavigation.visibleRange}
      previewCanDrillUp={form.chartNavigation.canDrillUp}
      previewResolution={preview.series?.resolution ?? null}
      previewError={previewError}
      onActivatePreviewBucket={handleActivatePreviewBucket}
      onDrillUpPreviewRange={form.drillUpChartRange}
      onLocationChange={(value) => form.setField('location', value)}
      onBasePollenChange={(value) => form.setField('basePollen', value)}
      onStartDateChange={(value) => form.setField('startDate', value)}
      onEndDateChange={(value) => form.setField('endDate', value)}
      onRuleEnabledChange={(value) => form.setField('ruleEnabled', value)}
      onCancel={() => router.replace(listHref)}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}
