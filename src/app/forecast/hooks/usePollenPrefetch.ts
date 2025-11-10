
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { getHourlyForecast } from '@/lib/api/forecast';
import type { PollenApiKey } from '@/app/forecast/constants';

interface ForecastParams {
  date: string;
  hour: number;
  pollen: PollenApiKey;
  box: string;
  includeCoords?: boolean;
  intervals?: string;
}

export const usePollenPrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchNextHours = useCallback(
    async (baseParams: ForecastParams, baseHour: number, hoursAhead = 3) => {
      const { pollen } = baseParams;
      const hoursToPrefetch = Array.from({ length: hoursAhead }, (_, i) => (baseHour + i + 1) % 48);

      await Promise.all(
        hoursToPrefetch.map(async (hour) => {
          const nextParams = { ...baseParams, hour };
          const normalized = {
            ...nextParams,
            date: dayjs(nextParams.date + 'T00:00:00')
              .add(nextParams.hour >= 24 ? 1 : 0, 'day')
              .format('YYYY-MM-DD'),
            hour: nextParams.hour % 24,
          };

          await queryClient.prefetchQuery({
            queryKey: ['hourlyForecast', normalized],
            queryFn: () => getHourlyForecast(normalized),
            staleTime: 1000 * 60 * 10,
          });
        })
      );
    },
    [queryClient]
  );

  return { prefetchNextHours };
};
