'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

import { getHourlyForecast } from '@/lib/api/forecast';

import {
  useLoadingStore,
  usePartialLoadingStore,
  usePollenDetailsChartStore,
} from '@/app/forecast/stores';

import {
  LoadingOverlay,
  ForecastMap,
  SearchCardToggle,
  LocationSearch,
  LocationButton,
  ForecastHeader,
  PollenSelector,
  PollenLegend,
  PollenLegendCard,
  LoadingSpinner,
  PollenTimeline,
} from '@/app/forecast/components';

import {
  DEFAULT_POLLEN_API_KEY,
  type PollenApiKey,
} from '@/app/forecast/constants';
import { useHourlyForecast } from '../hooks/useHourlyForecast';
import { useQueryClient } from '@tanstack/react-query';

const PollenDetailsChart = dynamic(
  () => import('./ui/PollenDetailsChart').then((mod) => mod.PollenDetailsChart),
  { ssr: false }
);

export const ForecastMapContainer = () => {
  const t = useTranslations('forecastPage');
  const tSearch = useTranslations('forecastPage.search');
  const tLocation = useTranslations('forecastPage.show_your_location');

  const { loading, setLoading } = useLoadingStore();
  const { partialLoading, setPartialLoading } = usePartialLoadingStore();
  const { show: showPollenDetailsChart, setShow: setShowPollenDetailsChart } =
    usePollenDetailsChartStore();

  const [pollenSelected, setPollenSelected] = useState<PollenApiKey>(
    DEFAULT_POLLEN_API_KEY
  );
  const [pollenData, setPollenData] = useState<
    Array<[long: number, lat: number, value: number]>
  >([]);

  const [selectedHour, setSelectedHour] = useState(0);
  const [loadingHour, setLoadingHour] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [currentBox, setCurrentBox] = useState<number[] | null>(null);

  const legendCardRef = useRef<HTMLDivElement>(null);
  const allDataRef = useRef<[long: number, lat: number, value: number][][]>([]);

  // Build 48-hour window (from 00:00 today)
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // const currentDate = new Date().toISOString().split('T')[0];
  // TODO: remove this hardcoded date when the API will be able
  const currentDate: string = '2022-04-15';
  const queryClient = useQueryClient();

  const handlePollenChange = (apiKey: PollenApiKey) => {
    setPollenSelected(apiKey);
  };

  const addNewPollenData = (
    forecasts: number[],
    longs: number[],
    lats: number[],
    hour: number
  ) => {
    let values: Array<[long: number, lat: number, value: number]> = [];
    if (!forecasts.length || forecasts.length !== longs.length * lats.length) {
      allDataRef.current[hour] = values;
      return;
    }

    let i = 0;
    for (let long of longs) {
      for (let lat of lats) {
        let value = forecasts[i];
        if (value > 0) {
          if (value >= 1 && value <= 30) value = 0.2;
          else if (value <= 100) value = 0.4;
          else if (value <= 200) value = 0.6;
          else if (value <= 400) value = 0.8;
          else value = 0.9;
          values.push([lat, long, value]);
        }
        i++;
      }
    }

    allDataRef.current[hour] = values;
    setPollenData(values);
  };

  const loadHour = async (hour: number) => {
    setLoadingHour(hour);

    const now = new Date(currentDate);
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const isNextDay = hour >= 24;
    const dateToUse = isNextDay
      ? new Date(startOfToday.getTime() + 24 * 3600 * 1000)
      : startOfToday;

    const dateStr = dateToUse.toISOString().split('T')[0];
    const hourForApi = isNextDay ? hour - 24 : hour;

    const params = {
      date: dateStr,
      hour: hourForApi,
      pollen: pollenSelected,
      box: '7.7893676757813735,46.51390491298438,15.210632324218798,50.986455071208994',
      includeCoords: true,
    };

    try {
      //Check if it's already cached
      let cached = queryClient.getQueryData(['hourlyForecast', params]);

      //If it's not there, it retrieves and caches it
      if (!cached) {
        cached = await queryClient.fetchQuery({
          queryKey: ['hourlyForecast', params],
          queryFn: () => getHourlyForecast(params),
          staleTime: 1000 * 60 * 10,
        });
      }

      // Use data (cached or new)
      if (cached) {
        const { data: res, latitudes, longitudes } = cached;
        addNewPollenData(res, longitudes, latitudes, hour);
      }
    } catch (err) {
      console.error('Failed to load hour', hour, err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = useCallback((box: number[]) => {
    setCurrentBox(box);
  }, []);

  // Handle hour change
  const handleSliderChange = async (hour: number) => {
    setPlaying(false);
    setSelectedHour(hour);
    await loadHour(hour);
    setPollenData(allDataRef.current[hour] || []);
  };

  // Playback
  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(async () => {
      const nextHour = (selectedHour + 1) % 48;
      setSelectedHour(nextHour);
      await loadHour(nextHour);
      setPollenData(allDataRef.current[nextHour] || []);
    }, 1000);

    return () => clearInterval(interval);
  }, [playing, selectedHour]);

  // Set current hour on mount
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffHours = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60)
    );
    setSelectedHour(diffHours);
    loadHour(diffHours);
  }, []);
  return (
    <div className="relative h-screen w-screen">
      {/* Main content */}
      <ForecastMap
        pollenData={pollenData}
        onRegionChange={handleRegionChange}
      />
      <span className="absolute top-8 right-6 z-50 flex flex-col items-start gap-2">
        <SearchCardToggle title={tSearch('title_tooltip_search')}>
          {(open, setOpen) => (
            <LocationSearch
              open={open}
              onSelect={(pos) => {
                setUserLocation(pos);
                setOpen(false);
              }}
            />
          )}
        </SearchCardToggle>
        <LocationButton tooltipText={tLocation('title_tooltip_location')} />
      </span>
      <div className="relative">
        <ForecastHeader title={t('title')} iconSrc="/zaum.png" />

        {partialLoading && (
          <div className="fixed inset-0 flex justify-center items-center bg-card/70 z-100">
            <LoadingSpinner size={40} color="border-white" />
          </div>
        )}
      </div>
      <span className="absolute top-18 z-50">
        <PollenSelector onChange={handlePollenChange} />
      </span>
      {!selectorOpen && showPollenDetailsChart && (
        <PollenDetailsChart onClose={() => setShowPollenDetailsChart(false)} />
      )}
      <div className="absolute bottom-13 sm:bottom-13 md:bottom-13 left-1/2 -translate-x-1/2 z-50">
        <PollenTimeline
          setPlaying={setPlaying}
          playing={playing}
          activeHour={selectedHour}
          onHourChange={handleSliderChange}
        />
      </div>
      <div
        className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 2xl:left-10 2xl:translate-x-0 2xl:bottom-14"
        onMouseEnter={() => setLegendOpen(true)}
        onMouseLeave={() => setLegendOpen(false)}
      >
        <PollenLegend width={350} height={25} />
      </div>
      {/* Separate container for the card */}ˇ
      <div className="fixed left-10 bottom-40 2xl:bottom-24">
        <PollenLegendCard
          open={legendOpen}
          levels={[
            { key: 'very_low', color: '#00e838' },
            { key: 'low', color: '#a5eb02' },
            { key: 'moderate', color: '#ebbb02' },
            { key: 'high', color: '#f27200' },
            { key: 'very_high', color: '#ff0000' },
          ]}
          cardRef={legendCardRef}
        />
      </div>
      {/* LoadingOverlay */}
      {loading && <LoadingOverlay message={t('message_loading')} />}
    </div>
  );
};

export default ForecastMapContainer;
