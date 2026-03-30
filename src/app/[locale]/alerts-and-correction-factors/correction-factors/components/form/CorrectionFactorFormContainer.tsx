'use client';

import { useEffect, useRef, useState } from 'react';
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
import { useCorrectionFactorDetail, useCorrectionFactorForm } from '../../hooks';
import {
  buildCorrectionFactorWritePayload,
  mapCorrectionFactorRecordToFormValues,
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
  const [editHydrationMessage, setEditHydrationMessage] = useState<string | null>(
    null
  );
  const hydratedRecordIdRef = useRef<string | null>(null);
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

  useEffect(() => {
    if (!isEditMode || !detailQuery.data) {
      return;
    }

    if (hydratedRecordIdRef.current === detailQuery.data.id) {
      return;
    }

    try {
      form.replaceValues(mapCorrectionFactorRecordToFormValues(detailQuery.data));
      setEditHydrationMessage(null);
      hydratedRecordIdRef.current = detailQuery.data.id;
    } catch {
      setEditHydrationMessage(t('editUnavailable.reason'));
      hydratedRecordIdRef.current = detailQuery.data.id;
    }
  }, [detailQuery.data, form, isEditMode, t]);

  const detailError =
    isEditMode && detailQuery.isError
      ? detailQuery.error instanceof Error
        ? `${t('states.loadError')} ${detailQuery.error.message}`
        : t('states.loadError')
      : null;
  const editHydrationBlocked =
    isEditMode &&
    !detailQuery.isLoading &&
    !detailError &&
    Boolean(detailQuery.data && editHydrationMessage);
  const submitDisabled =
    saving ||
    deleting ||
    (isEditMode &&
      (!correctionFactorId ||
        detailQuery.isLoading ||
        Boolean(detailError) ||
        editHydrationBlocked));
  const deleteDisabled =
    deleting ||
    saving ||
    !correctionFactorId ||
    detailQuery.isLoading ||
    Boolean(detailError);
  const locationOptionsError = locationsError
    ? locationsQueryError instanceof Error
      ? locationsQueryError.message
      : t('meta.optionsLoadError')
    : null;
  const pollenOptionsError = pollensError
    ? pollensQueryError instanceof Error
      ? pollensQueryError.message
      : t('meta.optionsLoadError')
    : null;

  async function invalidateCorrectionFactorQueries(id?: string) {
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
      });

      if (isEditMode && correctionFactorId) {
        const response = await updateCorrectionFactor(correctionFactorId, payload);
        const nextId = String(response.data.id);

        await invalidateCorrectionFactorQueries(nextId);
      } else {
        const response = await createCorrectionFactor(payload);
        const nextId = String(response.data.id);

        await invalidateCorrectionFactorQueries(nextId);
      }

      router.replace(listHref);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : isEditMode
            ? t('updateErrorFallback')
            : t('submitErrorFallback')
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
      await invalidateCorrectionFactorQueries(correctionFactorId);
      queryClient.removeQueries({
        queryKey: correctionFactorKeys.detail(correctionFactorId),
      });
      router.replace(listHref);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : t('deleteErrorFallback')
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
      derived={form.derived}
      locationOptions={locationOptions}
      pollenOptions={pollenOptions}
      locationsLoading={locationsLoading}
      pollensLoading={pollensLoading}
      locationsError={locationOptionsError}
      pollensError={pollenOptionsError}
      saving={saving}
      deleting={deleting}
      actionError={actionError}
      detailLoading={isEditMode ? detailQuery.isLoading : false}
      detailError={detailError}
      editHydrationBlocked={editHydrationBlocked}
      editHydrationMessage={editHydrationMessage}
      detailRecord={detailQuery.data ?? null}
      submitDisabled={submitDisabled}
      deleteDisabled={deleteDisabled}
      canDelete={isEditMode}
      canAddRow={Boolean(form.values.basePollen)}
      getPollenOptions={(currentRowPollen) =>
        form.getPollenOptions(currentRowPollen, pollenOptions)
      }
      onLocationChange={(value) => form.setField('location', value)}
      onBasePollenChange={(value) => form.setField('basePollen', value)}
      onStartDateChange={(value) => form.setField('startDate', value)}
      onEndDateChange={(value) => form.setField('endDate', value)}
      onDetectedEventsChange={form.setDetectedEventsInput}
      onPublishChange={(value) => form.setField('publishOnSave', value)}
      onAddRow={form.addRow}
      onPollenChange={form.updateRowPollen}
      onReviewedEventsChange={form.updateRowReviewedEvents}
      onRemoveRow={form.removeRow}
      onCancel={() => router.replace(listHref)}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}
