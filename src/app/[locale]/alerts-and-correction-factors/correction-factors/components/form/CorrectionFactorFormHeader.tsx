'use client';

import { useTranslations } from 'next-intl';

import { CorrectionFactorActions } from './CorrectionFactorActions';

interface CorrectionFactorFormHeaderProps {
  mode: 'create' | 'edit';
  saving: boolean;
  ruleEnabled: boolean;
  deleting?: boolean;
  actionError?: string | null;
  validationHint?: string | null;
  submitDisabled?: boolean;
  deleteDisabled?: boolean;
  showDelete?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  onRuleEnabledChange: (enabled: boolean) => void;
  onDelete?: () => void;
}

export function CorrectionFactorFormHeader({
  mode,
  saving,
  ruleEnabled,
  deleting = false,
  actionError,
  validationHint = null,
  submitDisabled = false,
  deleteDisabled = false,
  showDelete = false,
  onCancel,
  onSubmit,
  onRuleEnabledChange,
  onDelete,
}: CorrectionFactorFormHeaderProps) {
  const t = useTranslations('correctionFactorsPage.form');
  const title = mode === 'edit' ? t('editTitle') : t('title');
  const description =
    mode === 'edit' ? t('editDescription') : t('description');

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="xl:min-w-[360px] xl:max-w-[520px]">
          <CorrectionFactorActions
            mode={mode}
            saving={saving}
            ruleEnabled={ruleEnabled}
            deleting={deleting}
            actionError={actionError}
            validationHint={validationHint}
            submitDisabled={submitDisabled}
            deleteDisabled={deleteDisabled}
            showDelete={showDelete}
            onCancel={onCancel}
            onSubmit={onSubmit}
            onRuleEnabledChange={onRuleEnabledChange}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
