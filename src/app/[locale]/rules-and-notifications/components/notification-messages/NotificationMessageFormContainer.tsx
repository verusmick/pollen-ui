'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/features/i18n/routing';
import {
  createNotificationMessage,
  deleteNotificationMessage,
  updateNotificationMessage,
} from '@/lib/api/messageSystem';

import { messageSystemKeys } from '../../constants';
import {
  useNotificationMessageDetail,
  useNotificationsList,
} from '../../hooks';
import type {
  NotificationMessageFormErrors,
  NotificationMessageFormValues,
} from '../../utils';
import {
  buildNotificationMessageWritePayload,
  DEFAULT_NOTIFICATION_MESSAGE_FORM_VALUES,
  mapNotificationMessageRecordToFormValues,
  parseRequiredNotificationMessageNumber,
  toMessageSystemUserFacingError,
} from '../../utils';
import { NotificationMessageForm } from './NotificationMessageForm';

interface NotificationMessageFormContainerProps {
  mode?: 'create' | 'edit';
  notificationMessageId?: string;
}

export function NotificationMessageFormContainer({
  mode = 'create',
  notificationMessageId,
}: NotificationMessageFormContainerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('messageSystemPage.notificationMessages.form');
  const listHref = '/rules-and-notifications/notification-messages';
  const isEditMode = mode === 'edit';
  const [values, setValues] = useState<NotificationMessageFormValues>(
    DEFAULT_NOTIFICATION_MESSAGE_FORM_VALUES
  );
  const [errors, setErrors] = useState<NotificationMessageFormErrors>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const detailQuery = useNotificationMessageDetail(
    isEditMode ? notificationMessageId : undefined
  );
  const notificationsQuery = useNotificationsList();
  const hydratedValues = useMemo(
    () =>
      detailQuery.data
        ? mapNotificationMessageRecordToFormValues(detailQuery.data)
        : null,
    [detailQuery.data]
  );

  useEffect(() => {
    setActionError(null);
    setErrors({});
    setValues(DEFAULT_NOTIFICATION_MESSAGE_FORM_VALUES);
  }, [mode, notificationMessageId]);

  useEffect(() => {
    if (!isEditMode || !hydratedValues) {
      return;
    }

    setValues(hydratedValues);
  }, [hydratedValues, isEditMode]);

  const createMutation = useMutation({
    mutationFn: createNotificationMessage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.notificationMessagesList(),
      });
      router.push(listHref);
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (
      payload: ReturnType<typeof buildNotificationMessageWritePayload>
    ) => {
      if (!notificationMessageId) {
        throw new Error(t('validation.idRequired'));
      }

      return updateNotificationMessage(notificationMessageId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.notificationMessagesList(),
      });

      if (notificationMessageId) {
        await queryClient.invalidateQueries({
          queryKey: messageSystemKeys.notificationMessageDetail(
            notificationMessageId
          ),
        });
      }

      router.push(listHref);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!notificationMessageId) {
        throw new Error(t('validation.idRequired'));
      }

      return deleteNotificationMessage(notificationMessageId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.notificationMessagesList(),
      });
      queryClient.removeQueries({
        queryKey: messageSystemKeys.notificationMessageDetails(),
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

  function setField<K extends keyof NotificationMessageFormValues>(
    field: K,
    value: NotificationMessageFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateForm(): NotificationMessageFormErrors {
    const nextErrors: NotificationMessageFormErrors = {};
    const measureId = parseRequiredNotificationMessageNumber(values.measureId);
    const notificationId = parseRequiredNotificationMessageNumber(
      values.notificationId
    );
    const value = parseRequiredNotificationMessageNumber(values.value);

    if (measureId === null) {
      nextErrors.measureId = t('validation.measureIdRequired');
    }

    if (notificationId === null) {
      nextErrors.notificationId = t('validation.notificationIdRequired');
    }

    if (!values.creationDate.trim()) {
      nextErrors.creationDate = t('validation.creationDateRequired');
    }

    if (value === null) {
      nextErrors.value = t('validation.valueRequired');
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
      const payload = buildNotificationMessageWritePayload(
        values,
        notificationMessageId
      );

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
    <NotificationMessageForm
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
