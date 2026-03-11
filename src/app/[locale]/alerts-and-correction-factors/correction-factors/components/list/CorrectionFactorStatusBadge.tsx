'use client';

import { useTranslations } from 'next-intl';

import type { CorrectionFactorStatus } from '../../types';

interface CorrectionFactorStatusBadgeProps {
  status: CorrectionFactorStatus;
}

export function CorrectionFactorStatusBadge({
  status,
}: CorrectionFactorStatusBadgeProps) {
  const t = useTranslations('correctionFactorsPage.list.status');
  const classes =
    status === 'published'
      ? 'border-green-200 bg-green-50 text-green-700'
      : 'border-amber-200 bg-amber-50 text-amber-700';

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${classes}`}
    >
      {status === 'published' ? t('published') : t('draft')}
    </span>
  );
}
