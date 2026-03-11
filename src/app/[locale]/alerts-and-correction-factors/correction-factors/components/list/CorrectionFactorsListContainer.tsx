'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import {
  DEFAULT_CORRECTION_FACTOR_LIST_FILTERS,
  correctionFactorKeys,
} from '../../constants';
import type { CorrectionFactorListFilters } from '../../types';
import { useCorrectionFactorsList } from '../../hooks';
import { CorrectionFactorsFilters } from './CorrectionFactorsFilters';
import { CorrectionFactorsHeader } from './CorrectionFactorsHeader';
import { CorrectionFactorsTable } from './CorrectionFactorsTable';
import {
  getCorrectionFactorLocations,
  getCorrectionFactorPollens,
} from '@/lib/api/correctionFactors';

export function CorrectionFactorsListContainer() {
  const t = useTranslations('correctionFactorsPage.list.states');
  const [filters, setFilters] = useState<CorrectionFactorListFilters>(
    DEFAULT_CORRECTION_FACTOR_LIST_FILTERS
  );
  const { data = [], isLoading, isError, error } = useCorrectionFactorsList(
    filters
  );
  const {
    data: locationOptions = [],
    isLoading: isLocationOptionsLoading,
    isError: isLocationOptionsError,
  } = useQuery({
    queryKey: correctionFactorKeys.locations(),
    queryFn: getCorrectionFactorLocations,
    staleTime: 1000 * 60 * 10,
  });
  const locationNamesById = locationOptions.reduce<Record<string, string>>(
    (acc, option) => {
      acc[option.id] = option.name;
      return acc;
    },
    {}
  );
  const {
    data: pollenOptions = [],
    isLoading: isPollenOptionsLoading,
    isError: isPollenOptionsError,
  } = useQuery({
    queryKey: correctionFactorKeys.pollens(),
    queryFn: getCorrectionFactorPollens,
    staleTime: 1000 * 60 * 10,
  });
  const filteredData = useMemo(() => {
    return data.filter((record) => {
      const matchesLocation = filters.location
        ? record.location === filters.location
        : true;
      const matchesPollen = filters.pollen
        ? record.basePollen === filters.pollen
        : true;
      const matchesFrom = filters.from
        ? record.startDate.slice(0, 10) >= filters.from
        : true;

      return matchesLocation && matchesPollen && matchesFrom;
    });
  }, [data, filters]);

  return (
    <main className="flex h-full flex-col gap-4 p-4">
      <CorrectionFactorsHeader />
      <CorrectionFactorsFilters
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_CORRECTION_FACTOR_LIST_FILTERS)}
        locationOptions={locationOptions}
        pollenOptions={pollenOptions}
        locationOptionsLoading={isLocationOptionsLoading}
        pollenOptionsLoading={isPollenOptionsLoading}
        locationOptionsError={isLocationOptionsError}
        pollenOptionsError={isPollenOptionsError}
        disabled={isLoading}
      />

      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          {t('loading')}
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {t('error')}
          {error instanceof Error ? ` ${error.message}` : null}
        </div>
      ) : null}

      {!isLoading && !isError && filteredData.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          {t('empty')}
        </div>
      ) : null}

      {!isLoading && !isError && filteredData.length > 0 ? (
        <CorrectionFactorsTable
          rows={filteredData}
          locationNamesById={locationNamesById}
        />
      ) : null}
    </main>
  );
}
