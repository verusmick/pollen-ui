import { getNowCastingByCoords } from '@/lib/api/now-casting';
import { useState } from 'react';


export function useNowCasting() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNowCasting = async (params: {
    date: string;
    hour: string;
    pollen: string;
    include_coords?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getNowCastingByCoords(params);
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