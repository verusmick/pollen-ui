'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { deleteNotificationMessage } from '@/lib/api/messageSystem';

import { messageSystemKeys } from '../../constants';
import {
  useNotificationMessagesList,
  useNotificationsList,
} from '../../hooks';
import { toMessageSystemUserFacingError } from '../../utils';
import { NotificationMessagesHeader } from './NotificationMessagesHeader';
import { NotificationMessagesTable } from './NotificationMessagesTable';

export function NotificationMessagesListContainer() {
  const t = useTranslations('messageSystemPage.notificationMessages.list.states');
  const tableT = useTranslations(
    'messageSystemPage.notificationMessages.list.table'
  );
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data = [], isLoading, isFetching, isError, error } =
    useNotificationMessagesList();
  const { data: notifications = [] } = useNotificationsList();
  const notificationNamesById = useMemo(
    () =>
      notifications.reduce<Record<string, string>>((acc, notification) => {
        acc[notification.id] = notification.name;
        return acc;
      }, {}),
    [notifications]
  );
  const deleteMutation = useMutation({
    mutationFn: deleteNotificationMessage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.notificationMessagesList(),
      });
      queryClient.removeQueries({
        queryKey: messageSystemKeys.notificationMessageDetails(),
        type: 'inactive',
      });
    },
  });

  async function handleDelete(id: string) {
    setDeleteError(null);

    if (!window.confirm(tableT('deleteConfirm'))) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      setDeleteError(
        toMessageSystemUserFacingError(error, {
          fallbackMessage: tableT('deleteErrorFallback'),
        })
      );
    }
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pb-6">
      <NotificationMessagesHeader />

      {isLoading && data.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          {t('loading')}
        </div>
      ) : null}

      {!isLoading && isFetching && !isError ? (
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          {t('updating')}
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {toMessageSystemUserFacingError(error, {
            fallbackMessage: t('error'),
          })}
        </div>
      ) : null}

      {deleteError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {deleteError}
        </div>
      ) : null}

      {!isLoading && !isError && data.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          {t('empty')}
        </div>
      ) : null}

      {!isLoading && !isError && data.length > 0 ? (
        <NotificationMessagesTable
          rows={data}
          notificationNamesById={notificationNamesById}
          deletingId={
            deleteMutation.isPending ? deleteMutation.variables ?? null : null
          }
          onDelete={handleDelete}
        />
      ) : null}
    </main>
  );
}
