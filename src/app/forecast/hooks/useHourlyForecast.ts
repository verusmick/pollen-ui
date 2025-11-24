import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';

import { getHourlyForecast } from '@/lib/api/forecast';
import type { PollenApiKey } from '@/app/forecast/constants';

export function useHourlyForecast(params: {
  date: string;
  hour: number;
  pollen: PollenApiKey;
  box?: string;
  includeCoords?: boolean;
  intervals?: string;
}) {
  const normalizedParams = useMemo(() => {
    const start = dayjs(params.date + 'T00:00:00');
    const dateToUse = start.add(params.hour, 'hour');

    return {
      ...params,
      date: dateToUse.format('YYYY-MM-DD'),
      hour: dateToUse.hour(),
    };
  }, [params]);
  return useQuery({
    queryKey: ['hourlyForecast', normalizedParams],
    queryFn: () => getHourlyForecast(normalizedParams),
    staleTime: 1000 * 60 * 10,
  });
}
