
import { useEffect } from 'react';

interface PlaybackOptions {
  playing: boolean;
  isFetching: boolean;
  isLoading: boolean;
  onNextHour: () => void;
  intervalMs?: number;
}

export const usePollenPlayback = ({
  playing,
  isFetching,
  isLoading,
  onNextHour,
  intervalMs = 1000,
}: PlaybackOptions) => {
  useEffect(() => {
    if (!playing) return;
    let isRunning = false;

    const interval = setInterval(() => {
      if (isRunning || isFetching || isLoading) return;
      isRunning = true;
      onNextHour();
      isRunning = false;
    }, intervalMs);

    return () => clearInterval(interval);
  }, [playing, isFetching, isLoading, onNextHour, intervalMs]);
};
