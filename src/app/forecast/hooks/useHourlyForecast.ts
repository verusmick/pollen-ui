'use client';

import { useQuery } from '@tanstack/react-query';
import { getHourlyForecast } from '@/lib/api/forecast';
import type { PollenApiKey } from '@/app/forecast/constants';

export function useHourlyForecast(params: {
  date: string;
  hour: number;
  pollen: PollenApiKey;
  box: string;
  includeCoords?: boolean;
}) {
  return useQuery({
    queryKey: ['hourlyForecast', params],
    queryFn: () => getHourlyForecast(params),
    staleTime: 1000 * 60 * 10,
  });
}
