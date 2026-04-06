'use client';

import { useTranslations } from 'next-intl';

import type {
  CorrectionFactorValidationEvent,
  CorrectionFactorValidationEventsStatus,
} from '../../types';

interface CorrectionFactorEventCarouselProps {
  status: CorrectionFactorValidationEventsStatus;
  events: CorrectionFactorValidationEvent[];
  errorMessage?: string | null;
  activeEventIndex: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSelectEvent: (index: number) => void;
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
  errorMessage = null,
  activeEventIndex,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onSelectEvent,
}: CorrectionFactorEventCarouselProps) {
  const t = useTranslations('correctionFactorsPage.form.eventsCarousel');
  const activeEvent = events[activeEventIndex] ?? null;

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p>
        </div>
        <div className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          {t('count', { count: events.length })}
        </div>
      </div>

      {status === 'idle' ? (
        <div className="mt-4 rounded-lg border border-dashed border-border bg-background px-4 py-8 text-sm text-muted-foreground">
          {t('idle')}
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className="mt-4 space-y-3">
          <div className="aspect-square w-full animate-pulse rounded-lg bg-muted" />
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

      {status === 'ready' && activeEvent ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_88px]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-border bg-background">
              <img
                src={activeEvent.imageUrl}
                alt={t('imageAlt', {
                  classification: activeEvent.classification,
                  index: activeEventIndex + 1,
                })}
                className="aspect-square w-full object-cover"
              />
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-background p-4 text-sm">
              <div>
                <div className="text-muted-foreground">{t('classification')}</div>
                <div className="font-medium text-foreground">
                  {activeEvent.classification}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">{t('location')}</div>
                <div className="font-medium text-foreground">{activeEvent.device}</div>
              </div>
              <div>
                <div className="text-muted-foreground">{t('capturedAt')}</div>
                <div className="font-medium text-foreground">
                  {formatEventDatetime(activeEvent.datetime)}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('previous')}
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!canGoNext}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('next')}
              </button>
            </div>
          </div>

          <div className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto">
            {events.map((event, index) => {
              const isActive = index === activeEventIndex;

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onSelectEvent(index)}
                  className={`overflow-hidden rounded-lg border bg-background text-left transition ${
                    isActive
                      ? 'border-foreground shadow-sm'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  aria-label={t('thumbnailLabel', {
                    classification: event.classification,
                    index: index + 1,
                  })}
                >
                  <img
                    src={event.imageUrl}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
