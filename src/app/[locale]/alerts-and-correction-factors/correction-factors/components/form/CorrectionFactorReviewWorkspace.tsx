'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import type {
  CorrectionFactorFormDerivedState,
  CorrectionFactorReviewedValidationEvent,
  CorrectionFactorReviewSlice,
  CorrectionFactorValidationEventsStatus,
} from '../../types';
import { CorrectionFactorEventCarousel } from './CorrectionFactorEventCarousel';

interface CorrectionFactorReviewWorkspaceProps {
  open: boolean;
  status: CorrectionFactorValidationEventsStatus;
  events: CorrectionFactorReviewedValidationEvent[];
  acceptedEventIds?: string[];
  detectedEvents: number | null;
  derived: CorrectionFactorFormDerivedState;
  basePollen: string;
  selectedSliceLabel?: string | null;
  correctionMultiplier: number;
  reviewSlices: CorrectionFactorReviewSlice[];
  selectedSliceId: string | null;
  idleMessage?: string | null;
  errorMessage?: string | null;
  onToggleAccepted: (eventId: string) => void;
  onSelectReviewSlice: (sliceId: string) => void;
  onClose: () => void;
}

export function CorrectionFactorReviewWorkspace({
  open,
  status,
  events,
  acceptedEventIds = [],
  detectedEvents,
  derived,
  basePollen,
  selectedSliceLabel = null,
  correctionMultiplier,
  reviewSlices,
  selectedSliceId,
  idleMessage = null,
  errorMessage = null,
  onToggleAccepted,
  onSelectReviewSlice,
  onClose,
}: CorrectionFactorReviewWorkspaceProps) {
  const t = useTranslations('correctionFactorsPage.form.reviewWorkspace');
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(open);
  const markedAsBasePollenCount =
    derived.rows.find((row) => row.isBasePollen && !row.isSyntheticUnknown)
      ?.reviewedEventsNumber ?? 0;
  const unknownCount = derived.unknownReviewedEvents;
  const basePollenLabel = basePollen
    ? t('markedAsBasePollen', { basePollen })
    : t('markedAsBasePollenFallback');
  const selectedSliceIndex = reviewSlices.findIndex(
    (slice) => slice.id === selectedSliceId
  );
  const currentPeakNumber =
    selectedSliceIndex >= 0 ? selectedSliceIndex + 1 : null;
  const previousSlice =
    selectedSliceIndex > 0 ? reviewSlices[selectedSliceIndex - 1] : null;
  const nextSlice =
    selectedSliceIndex >= 0 && selectedSliceIndex < reviewSlices.length - 1
      ? reviewSlices[selectedSliceIndex + 1]
      : null;

  useEffect(() => {
    if (open) {
      setShouldRender(true);

      const frameId = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    setIsVisible(false);

    const timeoutId = window.setTimeout(() => {
      setShouldRender(false);
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label={t('close')}
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/20 transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-full max-w-[860px] flex-col border-l border-border bg-background shadow-2xl transition-all duration-200 ease-out ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t('eyebrow')}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              {t('title')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('description')}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-rose-600 bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:border-rose-700 hover:bg-rose-700"
          >
            {t('close')}
          </button>
        </div>

        <div className="border-b border-border px-4 py-4 sm:px-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (previousSlice) {
                  onSelectReviewSlice(previousSlice.id);
                }
              }}
              disabled={!previousSlice}
              className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('previousPeak')}
            </button>
            <div className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground">
              {currentPeakNumber === null
                ? t('currentPeakPending')
                : t('currentPeak', {
                    current: currentPeakNumber,
                    total: reviewSlices.length,
                  })}
            </div>
            <button
              type="button"
              onClick={() => {
                if (nextSlice) {
                  onSelectReviewSlice(nextSlice.id);
                }
              }}
              disabled={!nextSlice}
              className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('nextPeak')}
            </button>
          </div>

          <div className="mb-3 rounded-lg border border-border bg-card px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('selectedSlice')}
            </div>
            <div className="mt-2 text-sm font-medium text-foreground">
              {selectedSliceLabel ?? t('slicePending')}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('detectedEvents')}
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">
                {detectedEvents === null
                  ? t('countPending')
                  : t('count', { count: detectedEvents })}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {basePollenLabel}
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">
                {t('count', { count: markedAsBasePollenCount })}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('countedAsUnknown')}
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">
                {t('count', { count: unknownCount })}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('correctionMultiplier')}
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">
                {correctionMultiplier.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <CorrectionFactorEventCarousel
            status={status}
            events={events}
            basePollen={basePollen}
            acceptedEventIds={acceptedEventIds}
            idleMessage={idleMessage}
            errorMessage={errorMessage}
            onToggleAccepted={onToggleAccepted}
          />
        </div>
      </aside>
    </>
  );
}
