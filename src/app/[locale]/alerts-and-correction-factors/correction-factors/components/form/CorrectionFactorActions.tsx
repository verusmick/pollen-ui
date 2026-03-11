'use client';

import { useTranslations } from 'next-intl';

interface CorrectionFactorActionsProps {
  saving: boolean;
  submitError?: string | null;
  onCancel: () => void;
  onSubmit: () => void;
}

export function CorrectionFactorActions({
  saving,
  submitError,
  onCancel,
  onSubmit,
}: CorrectionFactorActionsProps) {
  const t = useTranslations('correctionFactorsPage.form.actions');

  return (
    <div className="space-y-3">
      {submitError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
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
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? t('saving') : t('save')}
        </button>
      </div>
    </div>
  );
}
