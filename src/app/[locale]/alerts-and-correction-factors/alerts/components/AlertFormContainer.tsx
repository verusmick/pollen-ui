'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/features/i18n/routing';
import { createAlert, deleteAlert, updateAlert } from '@/lib/api/messageSystem';
import {
  MESSAGE_SYSTEM_ALERT_TYPES,
  messageSystemKeys,
} from '@/app/[locale]/rules-and-notifications/constants';
import {
  useAlertDetail,
  useRulesList,
} from '@/app/[locale]/rules-and-notifications/hooks';
import { toMessageSystemUserFacingError } from '@/app/[locale]/rules-and-notifications/utils';

import type { AlertFormErrors, AlertFormValues } from '../utils';
import {
  buildAlertWritePayload,
  DEFAULT_ALERT_FORM_VALUES,
  mapAlertRecordToFormValues,
  parseRequiredNumber,
} from '../utils';
import { AlertForm } from './AlertForm';

interface AlertFormContainerProps {
  mode?: 'create' | 'edit';
  alertId?: string;
}

export function AlertFormContainer({
  mode = 'create',
  alertId,
}: AlertFormContainerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('alertsAndCorrectionFactorsPage.alerts.form');
  const listHref = '/alerts-and-correction-factors/alerts';
  const isEditMode = mode === 'edit';
  const [values, setValues] = useState<AlertFormValues>(
    DEFAULT_ALERT_FORM_VALUES
  );
  const [errors, setErrors] = useState<AlertFormErrors>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const detailQuery = useAlertDetail(isEditMode ? alertId : undefined);
  const rulesQuery = useRulesList();
  const hydratedValues = useMemo(
    () =>
      detailQuery.data ? mapAlertRecordToFormValues(detailQuery.data) : null,
    [detailQuery.data]
  );

  useEffect(() => {
    setActionError(null);
    setErrors({});
    setValues(DEFAULT_ALERT_FORM_VALUES);
  }, [mode, alertId]);

  useEffect(() => {
    if (!isEditMode || !hydratedValues) {
      return;
    }

    setValues(hydratedValues);
  }, [hydratedValues, isEditMode]);

  const createMutation = useMutation({
    mutationFn: createAlert,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.alertsList(),
      });
      router.push(listHref);
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (payload: ReturnType<typeof buildAlertWritePayload>) => {
      if (!alertId) {
        throw new Error(t('validation.idRequired'));
      }

      return updateAlert(alertId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.alertsList(),
      });

      if (alertId) {
        await queryClient.invalidateQueries({
          queryKey: messageSystemKeys.alertDetail(alertId),
        });
      }

      router.push(listHref);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!alertId) {
        throw new Error(t('validation.idRequired'));
      }

      return deleteAlert(alertId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.alertsList(),
      });
      queryClient.removeQueries({
        queryKey: messageSystemKeys.alertDetails(),
        type: 'inactive',
      });
      router.push(listHref);
    },
  });
  const saving = createMutation.isPending || updateMutation.isPending;
  const deleting = deleteMutation.isPending;
  const rulesError = rulesQuery.isError
    ? toMessageSystemUserFacingError(rulesQuery.error, {
        fallbackMessage: t('states.rulesLoadError'),
      })
    : null;

  function setField<K extends keyof AlertFormValues>(
    field: K,
    value: AlertFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateForm(): AlertFormErrors {
    const nextErrors: AlertFormErrors = {};
    const ruleId = parseRequiredNumber(values.ruleId);
    const minValue = parseRequiredNumber(values.minValue);
    const maxValue = parseRequiredNumber(values.maxValue);

    if (ruleId === null) {
      nextErrors.ruleId = t('validation.ruleIdRequired');
    }

    if (!MESSAGE_SYSTEM_ALERT_TYPES.some((alertType) => alertType === values.type)) {
      nextErrors.type = t('validation.typeRequired');
    }

    if (minValue === null) {
      nextErrors.minValue = t('validation.minValueRequired');
    }

    if (maxValue === null) {
      nextErrors.maxValue = t('validation.maxValueRequired');
    }

    return nextErrors;
  }

  async function handleSubmit() {
    setActionError(null);
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const payload = buildAlertWritePayload(values, alertId);

      if (isEditMode) {
        await updateMutation.mutateAsync(payload);
        return;
      }

      await createMutation.mutateAsync(payload);
    } catch (error) {
      setActionError(
        toMessageSystemUserFacingError(error, {
          fallbackMessage: isEditMode
            ? t('states.updateError')
            : t('states.createError'),
        })
      );
    }
  }

  async function handleDelete() {
    setActionError(null);

    if (!window.confirm(t('actions.deleteConfirm'))) {
      return;
    }

    try {
      await deleteMutation.mutateAsync();
    } catch (error) {
      setActionError(
        toMessageSystemUserFacingError(error, {
          fallbackMessage: t('states.deleteError'),
        })
      );
    }
  }

  if (isEditMode && detailQuery.isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pb-6">
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          {t('states.loadingDetail')}
        </div>
      </div>
    );
  }

  if (isEditMode && detailQuery.isError) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pb-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {toMessageSystemUserFacingError(detailQuery.error, {
            fallbackMessage: t('states.loadError'),
          })}
        </div>
      </div>
    );
  }

  return (
    <AlertForm
      mode={mode}
      values={values}
      errors={errors}
      ruleOptions={rulesQuery.data ?? []}
      ruleOptionsLoading={rulesQuery.isLoading}
      ruleOptionsError={rulesError}
      saving={saving}
      deleting={deleting}
      actionError={actionError}
      onFieldChange={setField}
      onSubmit={handleSubmit}
      onDelete={isEditMode ? handleDelete : undefined}
      onCancel={() => router.push(listHref)}
    />
  );
}
