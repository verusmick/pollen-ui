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
  const differenceLabel = derived.hasOverAllocatedEvents
    ? t('overAssigned')
    : t('remainingEvents');
  const differenceValue = derived.hasOverAllocatedEvents
    ? Math.abs(derived.remainingEvents)
    : derived.remainingEvents;

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-4 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background px-3 py-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('assignedEvents')}
          </div>
          <div className="mt-1 text-lg font-semibold text-foreground">
            {derived.assignedReviewedEvents}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background px-3 py-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('unknownEvents')}
          </div>
          <div className="mt-1 text-lg font-semibold text-foreground">
            {derived.unknownReviewedEvents}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background px-3 py-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('totalReviewedEvents')}
          </div>
          <div
            className={
              derived.hasOverAllocatedEvents
                ? 'mt-1 text-lg font-semibold text-red-600'
                : derived.unknownReviewedEvents > 0
                  ? 'mt-1 text-lg font-semibold text-amber-600'
                  : 'mt-1 text-lg font-semibold text-green-600'
            }
          >
            {derived.totalReviewedEvents}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background px-3 py-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {differenceLabel}
          </div>
          <div
            className={
              derived.hasOverAllocatedEvents
                ? 'mt-1 text-lg font-semibold text-red-600'
                : derived.isBalanced
                  ? 'mt-1 text-lg font-semibold text-green-600'
                  : 'mt-1 text-lg font-semibold text-amber-600'
            }
          >
            {differenceValue}
          </div>
        </div>
      </div>
      <div
        className={
          derived.hasOverAllocatedEvents
            ? 'text-xs text-red-600'
            : derived.isBalanced
              ? 'text-xs text-green-700'
              : 'text-xs text-amber-700'
        }
      >
        {derived.hasOverAllocatedEvents
          ? t('overAllocatedMessage', {
              count: Math.abs(derived.remainingEvents),
            })
          : derived.isBalanced
            ? t('balancedMessage')
            : t('unknownRemainderMessage', {
                count: derived.unknownReviewedEvents,
              })}
      </div>
      {tableError ? <div className="text-xs text-red-600">{tableError}</div> : null}
    </div>
  );
}
