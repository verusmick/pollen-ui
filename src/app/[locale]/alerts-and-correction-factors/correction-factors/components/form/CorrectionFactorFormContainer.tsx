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
  toCorrectionFactorUserFacingError,
} from '../../utils';
import { CorrectionFactorForm } from './CorrectionFactorForm';

interface CorrectionFactorFormContainerProps {
  mode?: CorrectionFactorFormMode;
  correctionFactorId?: string;
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
      };
    }

    return null;
  }, [form.values.selectedReviewSliceId, preview.reviewSlices, preview.series]);
  const hasSelectedPreviewSlice = selectedPreviewSlice !== null;
  const selectedPreviewSliceId = selectedPreviewSlice?.id ?? null;
  const selectedPreviewSliceFrom = selectedPreviewSlice?.from ?? null;
  const selectedPreviewSliceTo = selectedPreviewSlice?.to ?? null;
  const validationEvents = useCorrectionFactorValidationEvents({
    location: validationLocation,
    basePollen: form.values.basePollen,
    selectedReviewSliceId: selectedPreviewSliceId,
    selectedReviewSliceFrom: selectedPreviewSliceFrom,
    selectedReviewSliceTo: selectedPreviewSliceTo,
  });

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

    form.replaceValues(mapCorrectionFactorRecordToFormValues(detailQuery.data));
    hydratedRecordIdRef.current = detailQuery.data.id;
  }, [detailQuery.data, form, isEditMode]);

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
      pendingAutoOpenSliceIdRef.current = form.values.selectedReviewSliceId;
      previousSelectedSliceIdRef.current = form.values.selectedReviewSliceId;
    }

    if (selectedPreviewSlice) {
      return;
    }

    pendingAutoOpenSliceIdRef.current = null;
    form.setSelectedReviewSliceId(null);
  }, [form, form.values.selectedReviewSliceId, selectedPreviewSlice]);

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
    if (
      validationEvents.status === 'ready' ||
      validationEvents.status === 'empty'
    ) {
      form.replaceValidationEvents(validationEvents.events, {
        syncRows: !isEditMode,
      });

      if (form.values.detectedEvents !== validationEvents.detectedEvents) {
        form.setField('detectedEvents', validationEvents.detectedEvents);
      }

      return;
    }

    form.replaceValidationEvents([], {
      syncRows: !isEditMode,
    });

    if (form.values.detectedEvents !== null) {
      form.setField('detectedEvents', null);
    }
  }, [
    form,
    validationEvents.detectedEvents,
    validationEvents.events,
    validationEvents.status,
  ]);

  const detailError =
    isEditMode && detailQuery.isError ? t('states.loadError') : null;
  const showStoredMultiplierView =
    isEditMode && !form.hasReviewSessionChanges;
  const submitDisabled =
    saving ||
    deleting ||
    !form.isValid ||
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
    ? validationLocationMappingError
    : validationEvents.status === 'error'
      ? toCorrectionFactorUserFacingError(validationEvents.error, {
          fallbackMessage: t('meta.detectedEventsError'),
          mismatchMessage: t('meta.detectedEventsMismatchError'),
        })
      : null;
  const carouselValidationStatus = validationLocationMappingError
    ? 'error'
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

    if (submitDisabled) {
      return;
    }

    if (!form.validate()) {
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
      validationSummary={form.validationSummary}
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
      validationEventsIdleMessage={carouselIdleMessage}
      validationEventsError={carouselValidationError}
      validationEventsStatusText={validationEventsStatusText}
      validationEventsFieldError={validationEventsError}
      onToggleValidationEventAccepted={form.toggleEventAccepted}
      reviewWorkspaceOpen={reviewWorkspaceOpen}
      onOpenReviewWorkspace={() => setReviewWorkspaceOpen(true)}
      onCloseReviewWorkspace={() => setReviewWorkspaceOpen(false)}
      onSelectReviewSlice={handleSelectReviewSlice}
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
      previewReviewSlices={preview.reviewSlices}
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
      onCancel={() => router.replace(listHref)}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}
