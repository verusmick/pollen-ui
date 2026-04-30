'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/features/i18n/routing';
import {
  createNotification,
  deleteNotification,
  updateNotification,
} from '@/lib/api/messageSystem';

import { messageSystemKeys } from '../../constants';
import { useNotificationDetail } from '../../hooks';
import type { NotificationFormErrors, NotificationFormValues } from '../../utils';
import {
  buildNotificationWritePayload,
  DEFAULT_NOTIFICATION_FORM_VALUES,
  isEmailLike,
  mapNotificationRecordToFormValues,
  parseRecipients,
  toMessageSystemUserFacingError,
} from '../../utils';
import { NotificationForm } from './NotificationForm';

interface NotificationFormContainerProps {
  mode?: 'create' | 'edit';
  notificationId?: string;
}

export function NotificationFormContainer({
  mode = 'create',
  notificationId,
}: NotificationFormContainerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('messageSystemPage.notifications.form');
  const listHref = '/rules-and-notifications/notifications';
  const isEditMode = mode === 'edit';
  const [values, setValues] = useState<NotificationFormValues>(
    DEFAULT_NOTIFICATION_FORM_VALUES
  );
  const [errors, setErrors] = useState<NotificationFormErrors>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const detailQuery = useNotificationDetail(
    isEditMode ? notificationId : undefined
  );
  const hydratedValues = useMemo(
    () =>
      detailQuery.data
        ? mapNotificationRecordToFormValues(detailQuery.data)
        : null,
    [detailQuery.data]
  );

  useEffect(() => {
    setActionError(null);
    setErrors({});
    setValues(DEFAULT_NOTIFICATION_FORM_VALUES);
  }, [mode, notificationId]);

  useEffect(() => {
    if (!isEditMode || !hydratedValues) {
      return;
    }

    setValues(hydratedValues);
  }, [hydratedValues, isEditMode]);

  const createMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.notificationsList(),
      });
      router.push(listHref);
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (payload: ReturnType<typeof buildNotificationWritePayload>) => {
      if (!notificationId) {
        throw new Error(t('validation.idRequired'));
      }

      return updateNotification(notificationId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.notificationsList(),
      });

      if (notificationId) {
        await queryClient.invalidateQueries({
          queryKey: messageSystemKeys.notificationDetail(notificationId),
        });
      }

      router.push(listHref);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!notificationId) {
        throw new Error(t('validation.idRequired'));
      }

      return deleteNotification(notificationId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.notificationsList(),
      });
      queryClient.removeQueries({
        queryKey: messageSystemKeys.notificationDetails(),
        type: 'inactive',
      });
      router.push(listHref);
    },
  });
  const saving = createMutation.isPending || updateMutation.isPending;
  const deleting = deleteMutation.isPending;

  function setField<K extends keyof NotificationFormValues>(
    field: K,
    value: NotificationFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleToggleAlertType(alertType: string) {
    setValues((current) => {
      const nextAlertTypes = current.alertTypes.includes(alertType)
        ? current.alertTypes.filter((candidate) => candidate !== alertType)
        : [...current.alertTypes, alertType];

      return { ...current, alertTypes: nextAlertTypes };
    });
    setErrors((current) => ({ ...current, alertTypes: undefined }));
  }

  function validateForm(): NotificationFormErrors {
    const recipients = parseRecipients(values.recipientsText);
    const nextErrors: NotificationFormErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = t('validation.nameRequired');
    }

    if (recipients.length === 0) {
      nextErrors.recipients = t('validation.recipientsRequired');
    } else if (recipients.some((recipient) => !isEmailLike(recipient))) {
      nextErrors.recipients = t('validation.recipientsInvalid');
    }

    if (values.alertTypes.length === 0) {
      nextErrors.alertTypes = t('validation.alertTypesRequired');
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
      const payload = buildNotificationWritePayload(values, notificationId);

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
    <NotificationForm
      mode={mode}
      values={values}
      errors={errors}
      saving={saving}
      deleting={deleting}
      actionError={actionError}
      onFieldChange={setField}
      onToggleAlertType={handleToggleAlertType}
      onSubmit={handleSubmit}
      onDelete={isEditMode ? handleDelete : undefined}
      onCancel={() => router.push(listHref)}
    />
  );
}
