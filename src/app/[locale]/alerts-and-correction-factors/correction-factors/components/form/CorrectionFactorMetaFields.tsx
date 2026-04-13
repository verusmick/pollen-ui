'use client';

import { useTranslations } from 'next-intl';

import type { CorrectionFactorLocationOption } from '@/lib/api/correctionFactors';
import type {
  CorrectionFactorFormErrors,
  CorrectionFactorFormValues,
  CorrectionFactorTimeOption,
  CorrectionFactorValidationEventsStatus,
} from '../../types';
import {
  combineCorrectionFactorDateTime,
  CORRECTION_FACTOR_TIME_OPTIONS,
  splitCorrectionFactorDateTime,
} from '../../utils';

interface CorrectionFactorMetaFieldsProps {
  values: CorrectionFactorFormValues;
  errors: CorrectionFactorFormErrors;
  validationErrors: CorrectionFactorFormErrors;
  locationOptions: CorrectionFactorLocationOption[];
  pollenOptions: string[];
  locationsLoading?: boolean;
  pollensLoading?: boolean;
  locationsError?: string | null;
  pollensError?: string | null;
  validationEventsStatus: CorrectionFactorValidationEventsStatus;
  validationEventsStatusText?: string | null;
  validationEventsError?: string | null;
  onLocationChange: (value: string) => void;
  onBasePollenChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function CorrectionFactorMetaFields({
  values,
  errors,
  validationErrors,
  locationOptions,
  pollenOptions,
  locationsLoading = false,
  pollensLoading = false,
  locationsError = null,
  pollensError = null,
  validationEventsStatus,
  validationEventsStatusText = null,
  validationEventsError = null,
  onLocationChange,
  onBasePollenChange,
  onStartDateChange,
  onEndDateChange,
}: CorrectionFactorMetaFieldsProps) {
  const t = useTranslations('correctionFactorsPage.form.meta');
  const detectedEventsDisplay =
    validationEventsStatus === 'loading'
      ? t('detectedEventsLoadingValue')
      : values.detectedEvents ?? t('detectedEventsValuePlaceholder');
  const detectedEventsBusy = validationEventsStatus === 'loading';
  const startDateTime = splitCorrectionFactorDateTime(values.startDate);
  const endDateTime = splitCorrectionFactorDateTime(values.endDate);
  const startDateError = errors.startDate || validationErrors.startDate;
  const endDateError = errors.endDate || validationErrors.endDate;

  function handleStartDateChange(date: string) {
    onStartDateChange(
      date
        ? combineCorrectionFactorDateTime(
            date,
            startDateTime.time || CORRECTION_FACTOR_TIME_OPTIONS[0]
          )
        : ''
    );
  }

  function handleStartHourChange(time: CorrectionFactorTimeOption) {
    if (!startDateTime.date) {
      return;
    }

    onStartDateChange(combineCorrectionFactorDateTime(startDateTime.date, time));
  }

  function handleEndDateChange(date: string) {
    onEndDateChange(
      date
        ? combineCorrectionFactorDateTime(
            date,
            endDateTime.time || CORRECTION_FACTOR_TIME_OPTIONS[0]
          )
        : ''
    );
  }

  function handleEndHourChange(time: CorrectionFactorTimeOption) {
    if (!endDateTime.date) {
      return;
    }

    onEndDateChange(combineCorrectionFactorDateTime(endDateTime.date, time));
  }

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t('location')}</span>
          <select
            value={values.location}
            onChange={(event) => onLocationChange(event.target.value)}
            disabled={locationsLoading || Boolean(locationsError)}
            className={`h-10 rounded-md border bg-card px-3 text-foreground ${
              errors.location || validationErrors.location
                ? 'border-red-300'
                : 'border-border'
            }`}
          >
            <option value="">
              {locationsLoading
                ? t('loading')
                : locationsError
                  ? t('loadError')
                  : t('allLocations')}
            </option>
            {locationOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {locationsError ? (
            <span className="text-xs text-amber-700">{locationsError}</span>
          ) : null}
          {errors.location ? (
            <span className="text-xs text-red-600">{errors.location}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t('basePollen')}</span>
          <select
            value={values.basePollen}
            onChange={(event) => onBasePollenChange(event.target.value)}
            disabled={pollensLoading || Boolean(pollensError)}
            className={`h-10 rounded-md border bg-card px-3 text-foreground ${
              errors.basePollen || validationErrors.basePollen
                ? 'border-red-300'
                : 'border-border'
            }`}
          >
            <option value="">
              {pollensLoading
                ? t('loading')
                : pollensError
                  ? t('loadError')
                  : t('allPollens')}
            </option>
            {pollenOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {pollensError ? (
            <span className="text-xs text-amber-700">{pollensError}</span>
          ) : null}
          {errors.basePollen ? (
            <span className="text-xs text-red-600">{errors.basePollen}</span>
          ) : null}
        </label>

        <div className="flex flex-col gap-1 text-sm md:col-span-2">
          <span className="text-muted-foreground">{t('startDate')}</span>
          <div className="grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_9rem]">
            <input
              type="date"
              value={startDateTime.date}
              max={endDateTime.date || undefined}
              onChange={(event) => handleStartDateChange(event.target.value)}
              className={`h-10 rounded-md border bg-card px-3 text-foreground ${
                startDateError ? 'border-red-300' : 'border-border'
              }`}
            />
            <select
              value={startDateTime.time}
              onChange={(event) =>
                handleStartHourChange(event.target.value as CorrectionFactorTimeOption)
              }
              disabled={!startDateTime.date}
              aria-label={t('startHour')}
              className={`h-10 rounded-md border bg-card px-3 text-foreground disabled:cursor-not-allowed disabled:bg-muted ${
                startDateError ? 'border-red-300' : 'border-border'
              }`}
            >
              <option value="">{t('selectHour')}</option>
              {CORRECTION_FACTOR_TIME_OPTIONS.map((timeOption) => (
                <option key={`start-${timeOption}`} value={timeOption}>
                  {timeOption}
                </option>
              ))}
            </select>
          </div>
          {startDateError ? (
            <span className="text-xs text-red-600">
              {startDateError}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1 text-sm md:col-span-2">
          <span className="text-muted-foreground">{t('endDate')}</span>
          <div className="grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_9rem]">
            <input
              type="date"
              value={endDateTime.date}
              min={startDateTime.date || undefined}
              onChange={(event) => handleEndDateChange(event.target.value)}
              className={`h-10 rounded-md border bg-card px-3 text-foreground ${
                endDateError ? 'border-red-300' : 'border-border'
              }`}
            />
            <select
              value={endDateTime.time}
              onChange={(event) =>
                handleEndHourChange(event.target.value as CorrectionFactorTimeOption)
              }
              disabled={!endDateTime.date}
              aria-label={t('endHour')}
              className={`h-10 rounded-md border bg-card px-3 text-foreground disabled:cursor-not-allowed disabled:bg-muted ${
                endDateError ? 'border-red-300' : 'border-border'
              }`}
            >
              <option value="">{t('selectHour')}</option>
              {CORRECTION_FACTOR_TIME_OPTIONS.map((timeOption) => (
                <option key={`end-${timeOption}`} value={timeOption}>
                  {timeOption}
                </option>
              ))}
            </select>
          </div>
          {endDateError ? (
            <span className="text-xs text-red-600">
              {endDateError}
            </span>
          ) : null}
          <span className="text-xs text-muted-foreground">{t('dateTimeHelp')}</span>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{t('detectedEvents')}</span>
            <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t('detectedEventsReadOnlyBadge')}
            </span>
          </span>
          <input
            type="text"
            value={detectedEventsDisplay}
            readOnly
            disabled
            aria-busy={detectedEventsBusy}
            className={`h-10 rounded-md border bg-muted px-3 text-foreground disabled:cursor-not-allowed disabled:opacity-100 ${
              errors.detectedEvents || validationErrors.detectedEvents
                ? 'border-red-300'
                : 'border-border'
            } ${detectedEventsBusy ? 'animate-pulse' : ''}`}
          />
          <span className="text-xs text-muted-foreground">
            {t('detectedEventsReadOnlyHelp')}
          </span>
          {validationEventsStatusText ? (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              {detectedEventsBusy ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : null}
              {validationEventsStatusText}
            </span>
          ) : null}
          {validationEventsError ? (
            <span className="text-xs text-amber-700">{validationEventsError}</span>
          ) : null}
          {errors.detectedEvents ? (
            <span className="text-xs text-red-600">{errors.detectedEvents}</span>
          ) : null}
        </label>
      </div>

    </section>
  );
}
