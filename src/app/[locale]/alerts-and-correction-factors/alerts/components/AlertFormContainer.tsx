'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/features/i18n/routing';
import { updateNotificationMessageStatus } from '@/lib/api/messageSystem';
import {
  MESSAGE_SYSTEM_NOTIFICATION_MESSAGE_STATUSES,
  messageSystemKeys,
} from '@/app/[locale]/rules-and-notifications/constants';
import { useNotificationMessageDetail } from '@/app/[locale]/rules-and-notifications/hooks';
import type { MessageSystemNotificationMessageStatus } from '@/app/[locale]/rules-and-notifications/types';
import { toMessageSystemUserFacingError } from '@/app/[locale]/rules-and-notifications/utils';

import { AlertForm } from './AlertForm';

interface AlertFormContainerProps {
  notificationMessageId?: string;
}

export function AlertFormContainer({
  notificationMessageId,
}: AlertFormContainerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('alertsAndCorrectionFactorsPage.alerts.form');
  const listHref = '/alerts-and-correction-factors/alerts';
  const [status, setStatus] =
    useState<MessageSystemNotificationMessageStatus>('UNRESOLVED');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const detailQuery = useNotificationMessageDetail(notificationMessageId);

  useEffect(() => {
    setActionError(null);
    setStatusError(null);
  }, [notificationMessageId]);

  useEffect(() => {
    if (
      !detailQuery.data ||
      !MESSAGE_SYSTEM_NOTIFICATION_MESSAGE_STATUSES.some(
        (option) => option === detailQuery.data?.status
      )
    ) {
      return;
    }

    setStatus(detailQuery.data.status as MessageSystemNotificationMessageStatus);
  }, [detailQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async (nextStatus: MessageSystemNotificationMessageStatus) => {
      if (!notificationMessageId) {
        throw new Error(t('validation.idRequired'));
      }

      return updateNotificationMessageStatus(notificationMessageId, {
        status: nextStatus,
      });
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

  function handleStatusChange(nextStatus: string) {
    setStatus(nextStatus as MessageSystemNotificationMessageStatus);
    setStatusError(null);
  }

  async function handleSubmit() {
    setActionError(null);
    setStatusError(null);

    if (
      !MESSAGE_SYSTEM_NOTIFICATION_MESSAGE_STATUSES.some(
        (option) => option === status
      )
    ) {
      setStatusError(t('validation.statusRequired'));
      return;
    }

    try {
      await updateMutation.mutateAsync(status);
    } catch (error) {
      setActionError(
        toMessageSystemUserFacingError(error, {
          fallbackMessage: t('states.updateError'),
        })
      );
    }
  }

  if (detailQuery.isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pb-6">
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          {t('states.loadingDetail')}
        </div>
      </div>
    );
  }

  if (detailQuery.isError) {
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
      record={detailQuery.data}
      status={status}
      statusError={statusError}
      saving={updateMutation.isPending}
      actionError={actionError}
      onStatusChange={handleStatusChange}
      onSubmit={handleSubmit}
      onCancel={() => router.push(listHref)}
    />
  );
}
