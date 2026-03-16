'use client';

import { useTranslations } from 'next-intl';

import { CorrectionFactorActions } from './CorrectionFactorActions';

interface CorrectionFactorFormHeaderProps {
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

export function CorrectionFactorFormHeader({
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
}: CorrectionFactorFormHeaderProps) {
  const t = useTranslations('correctionFactorsPage.form');
  const title = mode === 'edit' ? t('editTitle') : t('title');
  const description =
    mode === 'edit' ? t('editDescription') : t('description');

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="lg:min-w-[260px]">
        <CorrectionFactorActions
          mode={mode}
          saving={saving}
          deleting={deleting}
          actionError={actionError}
          submitDisabled={submitDisabled}
          deleteDisabled={deleteDisabled}
          showDelete={showDelete}
          onCancel={onCancel}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
