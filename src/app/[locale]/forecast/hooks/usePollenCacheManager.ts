
import { useRef, useCallback } from 'react';

export const usePollenCacheManager = () => {
  const allDataRef = useRef<Record<string, Record<number, string>>>({});

  const getCached = useCallback(
    (pollenKey: string, hour: number) => {
      const data = allDataRef.current[pollenKey]?.[hour];
      return data ? JSON.parse(data) : null;
    },
    []
  );

  const saveCache = useCallback(
    (pollenKey: string, hour: number, values: any[]) => {
      allDataRef.current[pollenKey] ??= {};
      allDataRef.current[pollenKey][hour] = JSON.stringify(values);
    },
    []
  );

  const pruneCache = useCallback((pollenKey: string, currentHour: number, range = 2) => {
    const hours = Object.keys(allDataRef.current[pollenKey] || {});
    for (const h of hours) {
      const hourIndex = Number(h);
      if (Math.abs(hourIndex - currentHour) > range) {
        delete allDataRef.current[pollenKey][hourIndex];
      }
    }
  }, []);

  return { allDataRef, getCached, saveCache, pruneCache };
};
