import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { PollenApiKey } from '@/app/now-casting/constants';
import { getHourlyNowCasting } from '@/lib/api/nowCasting';
import { getAdjacentHour, type HourPoint } from '@/app/now-casting/utils';

interface ForecastParams {
  date: string;
  hour: string;
  pollen: PollenApiKey;
  box: string;
  includeCoords?: boolean;
  intervals?: string;
}

export const usePollenPrefetch = () => {
  const queryClient = useQueryClient();

  function getNextApiHours(hours: HourPoint[], baseHourIndex: number, hoursAhead: number): HourPoint[] {
    const result: HourPoint[] = [];
    let currentIndex = baseHourIndex;

    for (let i = 0; i < hoursAhead; i++) {
      const next = getAdjacentHour(hours, currentIndex, 'next');
      if (!next) break;

      result.push(next);
      currentIndex = next.hourIndex;
    }

    return result;
  }

  const prefetchNextHours = useCallback(
    async (baseParams: ForecastParams, baseHour: number, hoursAhead = 3, timelineHours: HourPoint[]) => {
      const hoursToPrefetch: HourPoint[] = getNextApiHours(timelineHours, baseHour, hoursAhead);

      await Promise.all(
        hoursToPrefetch.map(async (hour: HourPoint) => {
          const nextParams = { ...baseParams, hour: hour.apiHour, date: hour.apiDate };
          const normalized = { ...nextParams };

          await queryClient.prefetchQuery({
            queryKey: ['hourlyNowCasting', normalized],
            queryFn: () => getHourlyNowCasting(normalized),
            staleTime: 1000 * 60 * 10,
          });
        })
      );
    },
    [queryClient]
  );

  return { prefetchNextHours };
};