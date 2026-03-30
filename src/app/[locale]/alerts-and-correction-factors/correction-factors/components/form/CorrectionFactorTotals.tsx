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
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">{t('assignedEvents')}</span>
        <span className="font-medium text-foreground">
          {derived.assignedReviewedEvents}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">{t('unknownEvents')}</span>
        <span className="font-medium text-foreground">
          {derived.unknownReviewedEvents}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">{t('totalReviewedEvents')}</span>
        <span
          className={
            derived.hasOverAllocatedEvents
              ? 'font-medium text-red-600'
              : derived.unknownReviewedEvents > 0
                ? 'font-medium text-amber-600'
                : 'font-medium text-green-600'
          }
        >
          {derived.totalReviewedEvents}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">{differenceLabel}</span>
        <span
          className={
            derived.hasOverAllocatedEvents
              ? 'font-medium text-red-600'
              : derived.isBalanced
                ? 'font-medium text-green-600'
                : 'font-medium text-amber-600'
          }
        >
          {differenceValue}
        </span>
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
