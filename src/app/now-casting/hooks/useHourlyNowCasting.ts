import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {type PollenApiKey} from '@/app/now-casting/constants'
import { getHourlyNowCasting } from '@/lib/api/nowCasting';

export function useHourlyNowCasting(params: {
  date: string;
  hour: number;
  pollen: PollenApiKey;
  box?: string;
  includeCoords?: boolean;
  intervals?: string;
  res?: number;
}) {
  const normalizedParams = useMemo(() => {
    return {
      ...params,
      hour: params.hour,
    };
  }, [params]);

  return useQuery({
    queryKey: ['hourlyNowCasting', normalizedParams],
    queryFn: () => getHourlyNowCasting(normalizedParams),
    staleTime: 1000 * 60 * 10,
  });
}
