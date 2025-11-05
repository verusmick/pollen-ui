import { useMemo } from 'react';
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
  const normalizedParams = useMemo(() => {
    const now = new Date(params.date);
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const isNextDay = params.hour >= 24;
    const dateToUse = isNextDay
      ? new Date(startOfToday.getTime() + 24 * 3600 * 1000)
      : startOfToday;

    const dateStr = dateToUse.toISOString().split('T')[0];
    const hourForApi = isNextDay ? params.hour - 24 : params.hour;

    return {
      ...params,
      date: dateStr,
      hour: hourForApi,
    };
  }, [params.date, params.hour, params.pollen, params.box, params.includeCoords]);
  return useQuery({
    queryKey: ['hourlyForecast', normalizedParams],
    queryFn: () => getHourlyForecast(normalizedParams),
    staleTime: 1000 * 60 * 10,
  });
}
