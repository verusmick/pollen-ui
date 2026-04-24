'use client';

import { useTranslations } from 'next-intl';

import type { CorrectionFactorFormDerivedState } from '../../types';

interface CorrectionFactorTotalsProps {
  derived: CorrectionFactorFormDerivedState;
  tableError?: string;
}

export function CorrectionFactorTotals({
  derived,
  tableError,
}: CorrectionFactorTotalsProps) {
  const t = useTranslations('correctionFactorsPage.form.totals');

  if (!derived.hasOverAllocatedEvents && !tableError) {
    return null;
  }

  return (
    <div className="space-y-2 text-sm">
      {derived.hasOverAllocatedEvents ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
        {derived.hasOverAllocatedEvents
          ? t('overAllocatedMessage', {
              count: Math.abs(derived.remainingEvents),
            })
          : null}
        </div>
      ) : null}
      {tableError ? <div className="text-xs text-red-600">{tableError}</div> : null}
    </div>
  );
}
