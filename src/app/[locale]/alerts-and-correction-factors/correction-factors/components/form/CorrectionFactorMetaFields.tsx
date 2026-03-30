'use client';

import { useTranslations } from 'next-intl';

import type { CorrectionFactorLocationOption } from '@/lib/api/correctionFactors';
import type { CorrectionFactorFormErrors, CorrectionFactorFormValues } from '../../types';

interface CorrectionFactorMetaFieldsProps {
  values: CorrectionFactorFormValues;
  errors: CorrectionFactorFormErrors;
  locationOptions: CorrectionFactorLocationOption[];
  pollenOptions: string[];
  locationsLoading?: boolean;
  pollensLoading?: boolean;
  locationsError?: string | null;
  pollensError?: string | null;
  onLocationChange: (value: string) => void;
  onBasePollenChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onDetectedEventsChange: (value: string) => void;
  onPublishChange: (value: boolean) => void;
}

export function CorrectionFactorMetaFields({
  values,
  errors,
  locationOptions,
  pollenOptions,
  locationsLoading = false,
  pollensLoading = false,
  locationsError = null,
  pollensError = null,
  onLocationChange,
  onBasePollenChange,
  onStartDateChange,
  onEndDateChange,
  onDetectedEventsChange,
  onPublishChange,
}: CorrectionFactorMetaFieldsProps) {
  const t = useTranslations('correctionFactorsPage.form.meta');

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
          className="h-10 rounded-md border border-border bg-card px-3 text-foreground"
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
          className="h-10 rounded-md border border-border bg-card px-3 text-foreground"
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

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">{t('detectedEvents')}</span>
        <input
          type="number"
          min="0"
          value={values.detectedEvents ?? ''}
          onChange={(event) => onDetectedEventsChange(event.target.value)}
          className="h-10 rounded-md border border-border bg-card px-3 text-foreground"
        />
        {errors.detectedEvents ? (
          <span className="text-xs text-red-600">{errors.detectedEvents}</span>
        ) : null}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">{t('startDate')}</span>
        <input
          type="date"
          value={values.startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          className="h-10 rounded-md border border-border bg-card px-3 text-foreground"
        />
        {errors.startDate ? (
          <span className="text-xs text-red-600">{errors.startDate}</span>
        ) : null}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">{t('endDate')}</span>
        <input
          type="date"
          value={values.endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
          className="h-10 rounded-md border border-border bg-card px-3 text-foreground"
        />
        {errors.endDate ? (
          <span className="text-xs text-red-600">{errors.endDate}</span>
        ) : null}
      </label>
      </div>

      <label className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm">
        <input
          type="checkbox"
          checked={values.publishOnSave}
          onChange={(event) => onPublishChange(event.target.checked)}
        />
        <span className="text-foreground">{t('publishOnSave')}</span>
      </label>
    </section>
  );
}
