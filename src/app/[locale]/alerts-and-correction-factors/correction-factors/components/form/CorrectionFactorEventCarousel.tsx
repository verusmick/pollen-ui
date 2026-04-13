'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { UNKNOWN_POLLEN_CODE } from '../../constants';
import type {
  CorrectionFactorReviewedValidationEvent,
  CorrectionFactorSelectablePollen,
  CorrectionFactorValidationEventsStatus,
} from '../../types';

interface CorrectionFactorEventCarouselProps {
  status: CorrectionFactorValidationEventsStatus;
  events: CorrectionFactorReviewedValidationEvent[];
  pollenOptions: CorrectionFactorSelectablePollen[];
  errorMessage?: string | null;
  activeEventIndex: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSelectEvent: (index: number) => void;
  onReviewedPollenChange: (
    eventId: string,
    reviewedPollen: CorrectionFactorSelectablePollen
  ) => void;
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
  pollenOptions,
  errorMessage = null,
  activeEventIndex,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onSelectEvent,
  onReviewedPollenChange,
}: CorrectionFactorEventCarouselProps) {
  const t = useTranslations('correctionFactorsPage.form.eventsCarousel');
  const activeEvent = events[activeEventIndex] ?? null;
  const [brokenImageIds, setBrokenImageIds] = useState<Record<string, true>>({});
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reviewedPollenOptions = Array.from(
    new Set([
      UNKNOWN_POLLEN_CODE,
      ...pollenOptions.filter((option) => option !== UNKNOWN_POLLEN_CODE),
    ])
  );

  useEffect(() => {
    setBrokenImageIds({});
  }, [events]);

  useEffect(() => {
    const activeThumbnail = thumbnailRefs.current[activeEventIndex];

    if (!activeThumbnail) {
      return;
    }

    activeThumbnail.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [activeEventIndex]);

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

      {status === 'ready' && activeEvent ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_88px]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-border bg-background">
              {brokenImageIds[activeEvent.id] ? (
                <div className="flex aspect-square items-center justify-center bg-muted px-6 text-center text-sm text-muted-foreground">
                  {t('imageUnavailable')}
                </div>
              ) : (
                <img
                  src={activeEvent.imageUrl}
                  alt={t('imageAlt', {
                    classification: activeEvent.classification,
                    index: activeEventIndex + 1,
                    reviewedClassification: activeEvent.reviewedPollen,
                  })}
                  className="aspect-square w-full object-cover"
                  onError={() => handleImageError(activeEvent.id)}
                />
              )}
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-background p-4 text-sm">
              <div>
                <div className="text-muted-foreground">{t('classification')}</div>
                <div className="font-medium text-foreground">
                  {activeEvent.classification}
                </div>
              </div>
              <label className="block">
                <span className="text-muted-foreground">
                  {t('reviewedClassification')}
                </span>
                <select
                  value={activeEvent.reviewedPollen}
                  onChange={(event) =>
                    onReviewedPollenChange(
                      activeEvent.id,
                      event.target.value as CorrectionFactorSelectablePollen
                    )
                  }
                  className="mt-1 h-9 w-full rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground"
                >
                  {reviewedPollenOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === UNKNOWN_POLLEN_CODE ? t('unknown') : option}
                    </option>
                  ))}
                </select>
              </label>
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

          <div className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto overscroll-contain pr-1">
            {events.map((event, index) => {
              const isActive = index === activeEventIndex;

              return (
                <button
                  key={event.id}
                  ref={(element) => {
                    thumbnailRefs.current[index] = element;
                  }}
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
                    reviewedClassification: event.reviewedPollen,
                  })}
                >
                  {brokenImageIds[event.id] ? (
                    <div className="flex aspect-square items-center justify-center bg-muted px-2 text-center text-[11px] text-muted-foreground">
                      {t('imageUnavailableShort')}
                    </div>
                  ) : (
                    <img
                      src={event.imageUrl}
                      alt=""
                      className="aspect-square w-full object-cover"
                      onError={() => handleImageError(event.id)}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
