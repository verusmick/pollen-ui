'use client';

import { useTranslations } from 'next-intl';

import type {
  CorrectionFactorReviewedValidationEvent,
  CorrectionFactorValidationEventsStatus,
} from '../../types';

interface CorrectionFactorReviewSummaryProps {
  status: CorrectionFactorValidationEventsStatus;
  events: CorrectionFactorReviewedValidationEvent[];
  detectedEvents: number | null;
  basePollen: string;
  hasSelectedSlice: boolean;
  statusText?: string | null;
  errorMessage?: string | null;
  onOpenReviewWorkspace: () => void;
}

export function CorrectionFactorReviewSummary({
  status,
  events,
  detectedEvents,
  basePollen,
  hasSelectedSlice,
  statusText = null,
  errorMessage = null,
  onOpenReviewWorkspace,
}: CorrectionFactorReviewSummaryProps) {
  const t = useTranslations('correctionFactorsPage.form.reviewSummary');
  const isReviewWorkspaceDisabled =
    !hasSelectedSlice || detectedEvents === null || detectedEvents <= 0;
  const acceptedCount = events.filter(
    (event) => event.reviewedPollen === basePollen
  ).length;
  const unknownCount = events.length - acceptedCount;

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground">
            3
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('description')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenReviewWorkspace}
          disabled={isReviewWorkspaceDisabled}
          className="inline-flex cursor-pointer items-center justify-center rounded-md border border-sky-600 bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:border-sky-700 hover:bg-sky-700 disabled:cursor-not-allowed disabled:border-border disabled:bg-background disabled:text-muted-foreground disabled:opacity-50"
        >
          {t('action')}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-background px-4 py-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('detectedEvents')}
          </div>
          <div className="mt-2 text-sm font-medium text-foreground">
            {detectedEvents === null
              ? t('countPending')
              : t('count', { count: detectedEvents })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background px-4 py-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('accepted')}
          </div>
          <div className="mt-2 text-sm font-medium text-foreground">
            {t('count', { count: acceptedCount })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background px-4 py-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('unknown')}
          </div>
          <div className="mt-2 text-sm font-medium text-foreground">
            {t('count', { count: unknownCount })}
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : statusText ? (
        <div className="mt-4 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
          {statusText}
        </div>
      ) : null}

      {status === 'ready' ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {t('readyHint', { basePollen })}
        </p>
      ) : null}
    </section>
  );
}
