'use client';

import { useTranslations } from 'next-intl';

interface CorrectionFactorActionsProps {
  mode: 'create' | 'edit';
  saving: boolean;
  deleting?: boolean;
  actionError?: string | null;
  showActionError?: boolean;
  submitDisabled?: boolean;
  deleteDisabled?: boolean;
  showDelete?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
}

export function CorrectionFactorActions({
  mode,
  saving,
  deleting = false,
  actionError,
  showActionError = true,
  submitDisabled = false,
  deleteDisabled = false,
  showDelete = false,
  onCancel,
  onSubmit,
  onDelete,
}: CorrectionFactorActionsProps) {
  const t = useTranslations('correctionFactorsPage.form.actions');
  const submitLabel =
    mode === 'edit'
      ? saving
        ? t('updating')
        : t('update')
      : saving
        ? t('saving')
        : t('save');

  return (
    <div className="space-y-3">
      {showActionError && actionError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background sm:w-auto"
        >
          {t('cancel')}
        </button>
        {showDelete && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting || deleteDisabled || saving}
            className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <span className="flex items-center justify-center gap-2">
              {deleting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : null}
              <span>{deleting ? t('deleting') : t('delete')}</span>
            </span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving || deleting || submitDisabled}
          aria-busy={saving}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <span className="flex items-center justify-center gap-2">
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            <span>{submitLabel}</span>
          </span>
        </button>
      </div>
    </div>
  );
}
