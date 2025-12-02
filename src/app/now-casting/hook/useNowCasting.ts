import { getNowCastingByCoords } from '@/lib/api/now-casting';
import { useState } from 'react';

export interface NowCastingResponse {
  data: Array<string | number>;
  longitudes: number[];
  latitudes: number[];
}

export function useNowCasting() {
  const [data, setData] = useState<NowCastingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNowCasting = async (params: {
    date: string;
    hour: string;
    pollen: string;
    include_coords?: boolean;
    box?: string;
    intervals?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response: NowCastingResponse = await getNowCastingByCoords(params);
      setData(response);
    } catch (err: any) {
      setError(err.message ?? 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchNowCasting,
  };
}
