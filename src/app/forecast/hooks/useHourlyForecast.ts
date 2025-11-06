import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';

import { getHourlyForecast } from '@/lib/api/forecast';
import type { PollenApiKey } from '@/app/forecast/constants';

export function useHourlyForecast(params: {
  date: string;
  hour: number;
  pollen: PollenApiKey;
  box: string;
  includeCoords?: boolean;
  intervals?: string
}) {
  const normalizedParams = useMemo(() => {
    const dateToUse = dayjs(params.date + 'T00:00:00')
      .add(params.hour >= 24 ? 1 : 0, 'day');

    return {
      ...params,
      date: dateToUse.format('YYYY-MM-DD'),
      hour: params.hour % 24,
    };
  }, [params]);
  return useQuery({
    queryKey: ['hourlyForecast', normalizedParams],
    queryFn: () => getHourlyForecast(normalizedParams),
    staleTime: 1000 * 60 * 10,
  });
}
