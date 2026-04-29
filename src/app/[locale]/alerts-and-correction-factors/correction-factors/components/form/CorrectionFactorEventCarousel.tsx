'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';

import type {
  CorrectionFactorReviewedValidationEvent,
  CorrectionFactorValidationEventCoordinates,
  CorrectionFactorValidationEventsStatus,
} from '../../types';

interface CorrectionFactorEventCarouselProps {
  status: CorrectionFactorValidationEventsStatus;
  events: CorrectionFactorReviewedValidationEvent[];
  basePollen: string;
  idleMessage?: string | null;
  errorMessage?: string | null;
  onToggleAccepted: (eventId: string) => void;
}

const INITIAL_EVENT_BATCH_SIZE = 30;
const EVENT_BATCH_SIZE = 30;

function formatEventDatetime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp * 1000));
}

interface ImageNaturalSize {
  width: number;
  height: number;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function buildCroppedImageStyle(
  imageUrl: string,
  coordinates: CorrectionFactorValidationEventCoordinates | null,
  naturalSize: ImageNaturalSize | undefined
): CSSProperties {
  const baseStyle: CSSProperties = {
    backgroundImage: `url(${imageUrl})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  };

  if (!coordinates || !naturalSize) {
    return baseStyle;
  }

  const cropWidth = clampNumber(coordinates.width, 1, naturalSize.width);
  const cropHeight = clampNumber(coordinates.height, 1, naturalSize.height);
  const cropX = clampNumber(coordinates.x, 0, Math.max(0, naturalSize.width - cropWidth));
  const cropY = clampNumber(coordinates.y, 0, Math.max(0, naturalSize.height - cropHeight));
  const positionX =
    naturalSize.width === cropWidth
      ? 50
      : (cropX / (naturalSize.width - cropWidth)) * 100;
  const positionY =
    naturalSize.height === cropHeight
      ? 50
      : (cropY / (naturalSize.height - cropHeight)) * 100;

  return {
    ...baseStyle,
    backgroundPosition: `${positionX}% ${positionY}%`,
    backgroundSize: `${(naturalSize.width / cropWidth) * 100}% ${
      (naturalSize.height / cropHeight) * 100
    }%`,
  };
}

export function CorrectionFactorEventCarousel({
  status,
  events,
  basePollen,
  idleMessage = null,
  errorMessage = null,
  onToggleAccepted,
}: CorrectionFactorEventCarouselProps) {
  const t = useTranslations('correctionFactorsPage.form.eventsCarousel');
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [brokenImageIds, setBrokenImageIds] = useState<Record<string, true>>({});
  const [imageNaturalSizes, setImageNaturalSizes] = useState<
    Record<string, ImageNaturalSize>
  >({});
  const [visibleEventCount, setVisibleEventCount] = useState(
    INITIAL_EVENT_BATCH_SIZE
  );
  const eventImageSetKey = useMemo(
    () => events.map((event) => `${event.id}:${event.imageUrl}`).join('|'),
    [events]
  );
  const visibleEvents = useMemo(
    () => events.slice(0, visibleEventCount),
    [events, visibleEventCount]
  );

  useEffect(() => {
    setBrokenImageIds({});
    setImageNaturalSizes({});
    setVisibleEventCount(INITIAL_EVENT_BATCH_SIZE);
  }, [eventImageSetKey]);

  useEffect(() => {
    if (status !== 'ready' || visibleEventCount >= events.length) {
      return;
    }

    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setVisibleEventCount((currentCount) =>
          Math.min(currentCount + EVENT_BATCH_SIZE, events.length)
        );
      },
      {
        rootMargin: '600px 0px',
      }
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [events.length, status, visibleEventCount]);

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

  function handleImageLoad(eventId: string, width: number, height: number) {
    setImageNaturalSizes((current) => {
      const currentSize = current[eventId];

      if (currentSize?.width === width && currentSize.height === height) {
        return current;
      }

      return {
        ...current,
        [eventId]: {
          width,
          height,
        },
      };
    });
  }

  return (
    <section className="min-h-0">
      {status === 'idle' ? (
        <div className="rounded-lg border border-dashed border-border bg-background px-4 py-8 text-sm text-muted-foreground">
          {idleMessage ?? t('idle')}
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className="space-y-3">
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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
          <p>{t('error')}</p>
          {errorMessage ? <p className="mt-2">{errorMessage}</p> : null}
        </div>
      ) : null}

      {status === 'empty' ? (
        <div className="rounded-lg border border-dashed border-border bg-background px-4 py-8 text-sm text-muted-foreground">
          {t('empty')}
        </div>
      ) : null}

      {status === 'ready' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('selectionInstruction', { basePollen })}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('selectionHint')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleEvents.map((event, index) => {
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
                      <div
                        aria-hidden="true"
                        style={buildCroppedImageStyle(
                          event.imageUrl,
                          event.coordinates,
                          imageNaturalSizes[event.id]
                        )}
                        className={`aspect-square w-full object-cover transition ${
                          isAccepted ? 'opacity-100' : 'opacity-65 group-hover:opacity-90'
                        }`}
                      >
                        <img
                          src={event.imageUrl}
                          alt={t('imageAlt', {
                            classification: event.classification,
                            index: index + 1,
                          })}
                          className="sr-only"
                          onLoad={(imageEvent) =>
                            handleImageLoad(
                              event.id,
                              imageEvent.currentTarget.naturalWidth,
                              imageEvent.currentTarget.naturalHeight
                            )
                          }
                          onError={() => handleImageError(event.id)}
                        />
                      </div>
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

                  <div className="p-3">
                    <div className="text-sm font-medium text-foreground">
                      {formatEventDatetime(event.datetime)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {visibleEventCount < events.length ? (
            <div
              ref={loadMoreRef}
              aria-hidden="true"
              className="h-8"
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
