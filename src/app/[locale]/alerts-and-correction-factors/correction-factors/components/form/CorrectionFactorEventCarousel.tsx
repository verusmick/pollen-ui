'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import type {
  CorrectionFactorReviewedValidationEvent,
  CorrectionFactorValidationEventsStatus,
} from '../../types';

interface CorrectionFactorEventCarouselProps {
  status: CorrectionFactorValidationEventsStatus;
  events: CorrectionFactorReviewedValidationEvent[];
  basePollen: string;
  selectedSliceLabel?: string | null;
  idleMessage?: string | null;
  errorMessage?: string | null;
  onToggleAccepted: (eventId: string) => void;
}

function formatEventDatetime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp * 1000));
}

export function CorrectionFactorEventCarousel({
  status,
  events,
  basePollen,
  selectedSliceLabel = null,
  idleMessage = null,
  errorMessage = null,
  onToggleAccepted,
}: CorrectionFactorEventCarouselProps) {
  const t = useTranslations('correctionFactorsPage.form.eventsCarousel');
  const [brokenImageIds, setBrokenImageIds] = useState<Record<string, true>>({});
  const acceptedCount = useMemo(
    () =>
      events.filter((event) => event.reviewedPollen === basePollen).length,
    [basePollen, events]
  );

  useEffect(() => {
    setBrokenImageIds({});
  }, [events]);

  function handleImageError(eventId: string) {
    setBrokenImageIds((current) => {
      if (current[eventId]) {
        return current;
      }

      return {
        ...current,
        [eventId]: true,
      };
    });
  }

  return (
    <section className="min-h-0 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground">
            3
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {selectedSliceLabel ? (
            <div className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground">
              {selectedSliceLabel}
            </div>
          ) : null}
          <div className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            {t('count', { count: events.length })}
          </div>
        </div>
      </div>

      {status === 'idle' ? (
        <div className="mt-4 rounded-lg border border-dashed border-border bg-background px-4 py-8 text-sm text-muted-foreground">
          {idleMessage ?? t('idle')}
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className="mt-4 space-y-3">
          <div className="aspect-square w-full animate-pulse rounded-lg bg-muted" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`carousel-skeleton-${index}`}
                className="aspect-square animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
          <p>{t('error')}</p>
          {errorMessage ? <p className="mt-2">{errorMessage}</p> : null}
        </div>
      ) : null}

      {status === 'empty' ? (
        <div className="mt-4 rounded-lg border border-dashed border-border bg-background px-4 py-8 text-sm text-muted-foreground">
          {t('empty')}
        </div>
      ) : null}

      {status === 'ready' ? (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('selectionInstruction', { basePollen })}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('selectionHint')}
              </p>
            </div>
            <div className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground">
              {t('acceptedCount', {
                acceptedCount,
                totalCount: events.length,
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {events.map((event, index) => {
              const isAccepted = event.reviewedPollen === basePollen;
              const isBroken = Boolean(brokenImageIds[event.id]);

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onToggleAccepted(event.id)}
                  aria-pressed={isAccepted}
                  className={`group overflow-hidden rounded-xl border text-left transition focus:outline-none focus:ring-2 focus:ring-foreground/20 ${
                    isAccepted
                      ? 'border-emerald-600 bg-emerald-50 shadow-sm ring-1 ring-emerald-200'
                      : 'border-border bg-background opacity-80 hover:border-muted-foreground hover:opacity-100'
                  }`}
                  aria-label={t('tileAriaLabel', {
                    classification: event.classification,
                    index: index + 1,
                    state: isAccepted
                      ? t('acceptedState', { basePollen })
                      : t('unknownState'),
                  })}
                >
                  <div className="relative">
                    {isBroken ? (
                      <div className="flex aspect-square items-center justify-center bg-muted px-4 text-center text-sm text-muted-foreground">
                        {t('imageUnavailable')}
                      </div>
                    ) : (
                      <img
                        src={event.imageUrl}
                        alt={t('imageAlt', {
                          classification: event.classification,
                          index: index + 1,
                        })}
                        className={`aspect-square w-full object-cover transition ${
                          isAccepted ? 'opacity-100' : 'opacity-65 group-hover:opacity-90'
                        }`}
                        onError={() => handleImageError(event.id)}
                      />
                    )}

                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                          isAccepted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-background/90 text-foreground'
                        }`}
                      >
                        {isAccepted
                          ? t('acceptedBadge', { basePollen })
                          : t('unknownBadge')}
                      </span>
                      <span className="rounded-full bg-background/90 px-2 py-1 text-[11px] font-medium text-foreground">
                        {t('tileNumber', { index: index + 1 })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 p-3">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {t('classification')}
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {event.classification}
                      </div>
                    </div>

                    <div className="grid gap-2 text-xs text-muted-foreground">
                      <div>
                        <div>{t('location')}</div>
                        <div className="font-medium text-foreground">{event.device}</div>
                      </div>
                      <div>
                        <div>{t('capturedAt')}</div>
                        <div className="font-medium text-foreground">
                          {formatEventDatetime(event.datetime)}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
