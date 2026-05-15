'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/features/i18n/routing';
import { createRule, deleteRule, updateRule } from '@/lib/api/messageSystem';

import {
  MESSAGE_SYSTEM_ALERT_TYPES,
  messageSystemKeys,
} from '../../constants';
import {
  useLocationOptions,
  useNotificationsList,
  usePollenOptions,
  useRuleDetail,
} from '../../hooks';
import type {
  RuleAlertFormErrors,
  RuleFormErrors,
  RuleFormValues,
} from '../../utils';
import {
  buildRuleWritePayload,
  DEFAULT_RULE_ALERT_FORM_VALUES,
  DEFAULT_RULE_FORM_VALUES,
  generateRuleIntervalsFromFlightPeriod,
  mapRuleRecordToFormValues,
  toMessageSystemUserFacingError,
} from '../../utils';
import { RuleForm } from './RuleForm';

interface RuleFormContainerProps {
  mode?: 'create' | 'edit';
  ruleId?: string;
}

export function RuleFormContainer({
  mode = 'create',
  ruleId,
}: RuleFormContainerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('messageSystemPage.rules.form');
  const listHref = '/rules-and-notifications/rules';
  const isEditMode = mode === 'edit';
  const [values, setValues] = useState<RuleFormValues>(
    DEFAULT_RULE_FORM_VALUES
  );
  const [errors, setErrors] = useState<RuleFormErrors>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const detailQuery = useRuleDetail(isEditMode ? ruleId : undefined);
  const notificationsQuery = useNotificationsList();
  const pollenOptionsQuery = usePollenOptions();
  const locationOptionsQuery = useLocationOptions();
  const hydratedValues = useMemo(
    () => (detailQuery.data ? mapRuleRecordToFormValues(detailQuery.data) : null),
    [detailQuery.data]
  );

  useEffect(() => {
    setActionError(null);
    setErrors({});
    setValues(DEFAULT_RULE_FORM_VALUES);
  }, [mode, ruleId]);

  useEffect(() => {
    if (!isEditMode || !hydratedValues) {
      return;
    }

    setValues(hydratedValues);
  }, [hydratedValues, isEditMode]);

  const createMutation = useMutation({
    mutationFn: createRule,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.rulesList(),
      });
      router.push(listHref);
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (payload: ReturnType<typeof buildRuleWritePayload>) => {
      if (!ruleId) {
        throw new Error(t('validation.idRequired'));
      }

      return updateRule(ruleId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.rulesList(),
      });

      if (ruleId) {
        await queryClient.invalidateQueries({
          queryKey: messageSystemKeys.ruleDetail(ruleId),
        });
      }

      router.push(listHref);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!ruleId) {
        throw new Error(t('validation.idRequired'));
      }

      return deleteRule(ruleId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.rulesList(),
      });
      queryClient.removeQueries({
        queryKey: messageSystemKeys.ruleDetails(),
        type: 'inactive',
      });
      router.push(listHref);
    },
  });
  const saving = createMutation.isPending || updateMutation.isPending;
  const deleting = deleteMutation.isPending;
  const notificationsError = notificationsQuery.isError
    ? toMessageSystemUserFacingError(notificationsQuery.error, {
        fallbackMessage: t('states.notificationsLoadError'),
      })
    : null;
  const pollenOptionsError = pollenOptionsQuery.isError
    ? toMessageSystemUserFacingError(pollenOptionsQuery.error, {
        fallbackMessage: t('states.pollenLoadError'),
      })
    : null;
  const locationOptionsError = locationOptionsQuery.isError
    ? toMessageSystemUserFacingError(locationOptionsQuery.error, {
        fallbackMessage: t('states.locationsLoadError'),
      })
    : null;

  function clearFieldError(field: keyof RuleFormErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function setField<K extends keyof RuleFormValues>(
    field: K,
    value: RuleFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    clearFieldError(field as keyof RuleFormErrors);

    if (field === 'flightStart' || field === 'flightEnd') {
      clearFieldError('flightPeriod');
    }
  }

  function setAlertField(
    index: number,
    field: keyof RuleFormValues['alerts'][number],
    value: string
  ) {
    setValues((current) => ({
      ...current,
      alerts: current.alerts.map((alert, alertIndex) =>
        alertIndex === index ? { ...alert, [field]: value } : alert
      ),
    }));
    setErrors((current) => {
      const alertRows = [...(current.alertRows ?? [])];
      alertRows[index] = { ...alertRows[index], [field]: undefined };
      return { ...current, alerts: undefined, alertRows };
    });
  }

  function addAlert() {
    setValues((current) => ({
      ...current,
      alerts: [...current.alerts, { ...DEFAULT_RULE_ALERT_FORM_VALUES }],
    }));
    clearFieldError('alerts');
  }

  function removeAlert(index: number) {
    setValues((current) => ({
      ...current,
      alerts: current.alerts.filter((_, alertIndex) => alertIndex !== index),
    }));
  }

  function validateForm(): RuleFormErrors {
    const nextErrors: RuleFormErrors = {};
    const intervals = generateRuleIntervalsFromFlightPeriod(
      values.flightStart,
      values.flightEnd
    );

    if (!values.name.trim()) {
      nextErrors.name = t('validation.nameRequired');
    }

    if (!values.pollen) {
      nextErrors.pollen = t('validation.pollenRequired');
    }

    if (values.locations.length === 0) {
      nextErrors.locations = t('validation.locationsRequired');
    }

    if (values.notificationIds.length === 0) {
      nextErrors.notificationIds = t('validation.notificationIdsRequired');
    }

    if (!values.flightStart.trim()) {
      nextErrors.flightStart = t('validation.flightStartRequired');
    }

    if (!values.flightEnd.trim()) {
      nextErrors.flightEnd = t('validation.flightEndRequired');
    }

    if (values.flightStart.trim() && values.flightEnd.trim()) {
      if (!intervals) {
        nextErrors.flightPeriod = t('validation.flightPeriodInvalid');
      } else if (intervals.length === 0) {
        nextErrors.flightPeriod = t('validation.generatedIntervalsRequired');
      }
    }

    if (values.alerts.length === 0) {
      nextErrors.alerts = t('validation.alertsRequired');
    }

    const alertRows = values.alerts.map((alert) => {
      const rowErrors: RuleAlertFormErrors = {};
      const minValue = Number(alert.minValue.trim());
      const maxValue = Number(alert.maxValue.trim());

      if (!MESSAGE_SYSTEM_ALERT_TYPES.some((type) => type === alert.type)) {
        rowErrors.type = t('validation.alertTypeRequired');
      }

      if (!Number.isFinite(minValue)) {
        rowErrors.minValue = t('validation.alertMinRequired');
      }

      if (!Number.isFinite(maxValue)) {
        rowErrors.maxValue = t('validation.alertMaxRequired');
      }

      return rowErrors;
    });

    if (alertRows.some((row) => Object.keys(row).length > 0)) {
      nextErrors.alertRows = alertRows;
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
      const payload = buildRuleWritePayload(values);

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
    <RuleForm
      mode={mode}
      values={values}
      errors={errors}
      notificationOptions={notificationsQuery.data ?? []}
      notificationOptionsLoading={notificationsQuery.isLoading}
      notificationOptionsError={notificationsError}
      pollenOptions={pollenOptionsQuery.data ?? []}
      pollenOptionsLoading={pollenOptionsQuery.isLoading}
      pollenOptionsError={pollenOptionsError}
      locationOptions={locationOptionsQuery.data ?? []}
      locationOptionsLoading={locationOptionsQuery.isLoading}
      locationOptionsError={locationOptionsError}
      saving={saving}
      deleting={deleting}
      actionError={actionError}
      onFieldChange={setField}
      onAlertFieldChange={setAlertField}
      onAddAlert={addAlert}
      onRemoveAlert={removeAlert}
      onSubmit={handleSubmit}
      onDelete={isEditMode ? handleDelete : undefined}
      onCancel={() => router.push(listHref)}
    />
  );
}
