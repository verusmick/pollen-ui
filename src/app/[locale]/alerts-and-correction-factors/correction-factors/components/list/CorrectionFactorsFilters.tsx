'use client';

import type { ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { CorrectionFactorLocationOption } from '@/lib/api/correctionFactors';

import type { CorrectionFactorListFilters } from '../../types';

interface CorrectionFactorsFiltersProps {
  value: CorrectionFactorListFilters;
  onChange: (nextValue: CorrectionFactorListFilters) => void;
  onReset: () => void;
  locationOptions: CorrectionFactorLocationOption[];
  pollenOptions: string[];
  locationOptionsLoading?: boolean;
  pollenOptionsLoading?: boolean;
  locationOptionsError?: boolean;
  pollenOptionsError?: boolean;
  disabled?: boolean;
}

function buildChangeHandler(
  value: CorrectionFactorListFilters,
  onChange: (nextValue: CorrectionFactorListFilters) => void,
  key: keyof CorrectionFactorListFilters
) {
  return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({
      ...value,
      [key]: event.target.value,
    });
  };
}

export function CorrectionFactorsFilters({
  value,
  onChange,
  onReset,
  locationOptions,
  pollenOptions,
  locationOptionsLoading = false,
  pollenOptionsLoading = false,
  locationOptionsError = false,
  pollenOptionsError = false,
  disabled = false,
}: CorrectionFactorsFiltersProps) {
  const t = useTranslations('correctionFactorsPage.list');

  const locationPlaceholder = locationOptionsLoading
    ? t('filters.loading')
    : t('filters.allLocations');

  const pollenPlaceholder = pollenOptionsLoading
    ? t('filters.loading')
    : t('filters.allPollens');

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
      <label className="flex min-w-[180px] flex-col gap-1 text-sm">
        <span className="text-muted-foreground">{t('filters.fromDate')}</span>
        <input
          type="date"
          value={value.from}
          onChange={buildChangeHandler(value, onChange, 'from')}
          disabled={disabled}
          className="h-9 rounded-md border border-border bg-background px-3 text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>

      <label className="flex min-w-[180px] flex-col gap-1 text-sm">
        <span className="text-muted-foreground">{t('filters.location')}</span>
        <select
          value={value.location}
          onChange={buildChangeHandler(value, onChange, 'location')}
          disabled={disabled || locationOptionsLoading || locationOptionsError}
          className="h-9 rounded-md border border-border bg-background px-3 text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            {locationOptionsError ? t('filters.allLocations') : locationPlaceholder}
          </option>
          {locationOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[180px] flex-col gap-1 text-sm">
        <span className="text-muted-foreground">{t('filters.pollen')}</span>
        <select
          value={value.pollen}
          onChange={buildChangeHandler(value, onChange, 'pollen')}
          disabled={disabled || pollenOptionsLoading || pollenOptionsError}
          className="h-9 rounded-md border border-border bg-background px-3 text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            {pollenOptionsError ? t('filters.allPollens') : pollenPlaceholder}
          </option>
          {pollenOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={onReset}
        disabled={disabled}
        className="h-9 rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t('filters.reset')}
      </button>

      {locationOptionsError || pollenOptionsError ? (
        <div className="basis-full rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {t('filters.optionsError')}
        </div>
      ) : null}
    </div>
  );
}
