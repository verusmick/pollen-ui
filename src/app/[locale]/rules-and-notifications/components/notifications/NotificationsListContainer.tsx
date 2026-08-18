'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { deleteNotification } from '@/lib/api/messageSystem';

import { messageSystemKeys } from '../../constants';
import { useNotificationsList } from '../../hooks';
import { toMessageSystemUserFacingError } from '../../utils';
import { NotificationsHeader } from './NotificationsHeader';
import { NotificationsTable } from './NotificationsTable';

export function NotificationsListContainer() {
  const t = useTranslations('messageSystemPage.notifications.list.states');
  const tableT = useTranslations('messageSystemPage.notifications.list.table');
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data = [], isLoading, isFetching, isError, error } =
    useNotificationsList();
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.notificationsList(),
      });
      queryClient.removeQueries({
        queryKey: messageSystemKeys.notificationDetails(),
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
    <main className="flex min-h-full flex-col gap-4 p-4 pb-6">
      <NotificationsHeader />

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
        <NotificationsTable
          rows={data}
          deletingId={
            deleteMutation.isPending ? deleteMutation.variables ?? null : null
          }
          onDelete={handleDelete}
        />
      ) : null}
    </main>
  );
}
