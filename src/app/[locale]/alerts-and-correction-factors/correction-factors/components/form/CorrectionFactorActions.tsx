'use client';

import { useTranslations } from 'next-intl';

interface CorrectionFactorActionsProps {
  mode: 'create' | 'edit';
  saving: boolean;
  deleting?: boolean;
  actionError?: string | null;
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
      {actionError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background"
        >
          {t('cancel')}
        </button>
        {showDelete && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting || deleteDisabled || saving}
            className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? t('deleting') : t('delete')}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving || deleting || submitDisabled}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
