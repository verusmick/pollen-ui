'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/features/i18n/routing';
import { createRule, deleteRule, updateRule } from '@/lib/api/messageSystem';

import { messageSystemKeys } from '../../constants';
import { useNotificationsList, useRuleDetail } from '../../hooks';
import type { RuleFormErrors, RuleFormValues } from '../../utils';
import {
  buildRuleWritePayload,
  DEFAULT_RULE_FORM_VALUES,
  mapRuleRecordToFormValues,
  parseNumericList,
  parseRequiredNumber,
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

  function setField<K extends keyof RuleFormValues>(
    field: K,
    value: RuleFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === 'notificationId' ? { notificationIds: undefined } : {}),
    }));
  }

  function validateForm(): RuleFormErrors {
    const nextErrors: RuleFormErrors = {};
    const measureId = parseRequiredNumber(values.measureId);
    const locationIds = parseNumericList(values.locationIdsText);
    const notificationId = parseRequiredNumber(values.notificationId);

    if (!values.name.trim()) {
      nextErrors.name = t('validation.nameRequired');
    }

    if (measureId === null) {
      nextErrors.measureId = t('validation.measureIdRequired');
    }

    if (!values.startDate.trim()) {
      nextErrors.startDate = t('validation.startDateRequired');
    }

    if (!values.endDate.trim()) {
      nextErrors.endDate = t('validation.endDateRequired');
    }

    if (locationIds.length === 0) {
      nextErrors.locationIds = t('validation.locationIdsRequired');
    }

    if (notificationId === null) {
      nextErrors.notificationIds = t('validation.notificationIdsRequired');
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
      const payload = buildRuleWritePayload(values, ruleId);

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
