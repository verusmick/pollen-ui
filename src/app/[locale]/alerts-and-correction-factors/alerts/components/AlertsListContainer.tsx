'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { deleteAlert } from '@/lib/api/messageSystem';
import { messageSystemKeys } from '@/app/[locale]/rules-and-notifications/constants';
import { useAlertsList, useRulesList } from '@/app/[locale]/rules-and-notifications/hooks';
import { toMessageSystemUserFacingError } from '@/app/[locale]/rules-and-notifications/utils';

import { AlertsHeader } from './AlertsHeader';
import { AlertsTable } from './AlertsTable';

export function AlertsListContainer() {
  const t = useTranslations('alertsAndCorrectionFactorsPage.alerts.list.states');
  const tableT = useTranslations('alertsAndCorrectionFactorsPage.alerts.list.table');
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data = [], isLoading, isFetching, isError, error } = useAlertsList();
  const { data: rules = [] } = useRulesList();
  const ruleNamesById = useMemo(
    () =>
      rules.reduce<Record<string, string>>((acc, rule) => {
        acc[rule.id] = rule.name;
        return acc;
      }, {}),
    [rules]
  );
  const deleteMutation = useMutation({
    mutationFn: deleteAlert,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: messageSystemKeys.alertsList(),
      });
      queryClient.removeQueries({
        queryKey: messageSystemKeys.alertDetails(),
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
      <AlertsHeader />

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
        <AlertsTable
          rows={data}
          ruleNamesById={ruleNamesById}
          deletingId={
            deleteMutation.isPending ? deleteMutation.variables ?? null : null
          }
          onDelete={handleDelete}
        />
      ) : null}
    </main>
  );
}
