'use client';

import { useTranslations } from 'next-intl';

import { CorrectionFactorActions } from './CorrectionFactorActions';

interface CorrectionFactorFormHeaderProps {
  saving: boolean;
  submitError?: string | null;
  onCancel: () => void;
  onSubmit: () => void;
}

export function CorrectionFactorFormHeader({
  saving,
  submitError,
  onCancel,
  onSubmit,
}: CorrectionFactorFormHeaderProps) {
  const t = useTranslations('correctionFactorsPage.form');

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </div>

      <div className="lg:min-w-[260px]">
        <CorrectionFactorActions
          saving={saving}
          submitError={submitError}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
