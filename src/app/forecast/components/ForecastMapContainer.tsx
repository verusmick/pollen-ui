'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';

import {
  useCoordinatesStore,
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
  DEFAULT_POLLEN,
  getLevelsForLegend,
  type PollenConfig,
} from '@/app/forecast/constants';

import {
  useHourlyForecast,
  usePollenPlayback,
  usePollenCacheManager,
  usePollenPrefetch,
} from '@/app/forecast/hooks';
import { fetchAndShowPollenChart } from '../utils';

const PollenDetailsChart = dynamic(
  () => import('./ui/PollenDetailsChart').then((mod) => mod.PollenDetailsChart),
  { ssr: false }
);

export const ForecastMapContainer = () => {
  const t = useTranslations('forecastPage');
  const tSearch = useTranslations('forecastPage.search');
  const tLocation = useTranslations('forecastPage.show_your_location');

  const { loading, setLoading } = useLoadingStore();
  const { partialLoading, setPartialLoading, chartLoading, setChartLoading } =
    usePartialLoadingStore();
  const { show: showPollenDetailsChart, setShow: setShowPollenDetailsChart } =
    usePollenDetailsChartStore();
  const { setLatitudes, setLongitudes } = useCoordinatesStore();

  const [pollenSelected, setPollenSelected] =
    useState<PollenConfig>(DEFAULT_POLLEN);
  const [pollenData, setPollenData] = useState<
    Array<[long: number, lat: number, value: number]>
  >([]);
  const [legendOpen, setLegendOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [selectedHour, setSelectedHour] = useState(0);

  const legendCardRef = useRef<HTMLDivElement>(null);
  const { getCached, saveCache, pruneCache } = usePollenCacheManager();
  const { prefetchNextHours } = usePollenPrefetch();

  const forecastParams = useMemo(
    () => ({
      date: pollenSelected.defaultBaseDate,
      hour: selectedHour,
      pollen: pollenSelected.apiKey,
      box: '7.7893676757813735,46.51390491298438,15.210632324218798,50.986455071208994',
      intervals: pollenSelected.apiIntervals,
      includeCoords: true,
    }),
    [pollenSelected, selectedHour]
  );

  const {
    data: mapData,
    isFetching,
    isLoading: mapDataIsLoading,
  } = useHourlyForecast(forecastParams);

  const handlePollenChange = (newPollen: PollenConfig) => {
    setPartialLoading(true);
    setPollenSelected(newPollen);
  };

  const handleSliderChange = useCallback((hour: number) => {
    setPlaying(false);
    setSelectedHour(hour);
  }, []);

  usePollenPlayback({
    playing,
    isFetching,
    isLoading: mapDataIsLoading,
    onNextHour: () => setSelectedHour((prev) => (prev + 1) % 48),
    intervalMs: 1000,
  });
  const loadPollenChart = async (
    pollenSelected: { apiKey: string; defaultBaseDate: string },
    setChartLoading: (v: boolean) => void
  ) => {
    const { latitude, longitude, setShow } =
      usePollenDetailsChartStore.getState();

    if (!latitude || !longitude) return;

    setChartLoading(true);
    setShow(true, '', null, latitude, longitude);

    try {
      await fetchAndShowPollenChart({
        lat: latitude,
        lng: longitude,
        pollen: pollenSelected.apiKey,
        date: pollenSelected.defaultBaseDate,
        setShowPollenDetailsChart: setShow,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setChartLoading(false);
    }
  };
  useEffect(() => {
    if (!mapData) return;

    const pollenKey = pollenSelected.apiKey;
    const cached = getCached(pollenKey, selectedHour);
    if (cached) {
      setPollenData(cached);
      prefetchNextHours(forecastParams, selectedHour, 3);
      setPartialLoading(false);
      return;
    }

    const { data, longitudes, latitudes } = mapData;
    setLatitudes(latitudes);
    setLongitudes(longitudes);

    const latsCount = latitudes.length;
    const values = data.map(
      (forecast: number, index: number) =>
        [
          latitudes[index % latsCount],
          longitudes[Math.floor(index / latsCount)],
          forecast / 10,
        ] as [number, number, number]
    );

    saveCache(pollenKey, selectedHour, values);
    pruneCache(pollenKey, selectedHour, 2);
    setPollenData(values);

    prefetchNextHours(forecastParams, selectedHour, 3);
    setPartialLoading(false);
  }, [mapData, selectedHour]);

  useEffect(() => {
    if (!mapDataIsLoading) setLoading(false);
  }, [mapDataIsLoading]);

  useEffect(() => {
    const diffHours = dayjs().diff(dayjs().startOf('day'), 'hour');
    handleSliderChange(diffHours);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      loadPollenChart(pollenSelected, setChartLoading);
    });
  }, [pollenSelected.apiKey]);

  return (
    <div className="relative h-screen w-screen">
      <ForecastMap
        pollenData={pollenData}
        onRegionChange={() => {}}
        pollenSelected={pollenSelected.apiKey}
        currentDate={pollenSelected.defaultBaseDate}
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
              currentDate={pollenSelected.defaultBaseDate}
              pollenSelected={pollenSelected.apiKey}
            />
          )}
        </SearchCardToggle>

        <LocationButton
          tooltipText={tLocation('title_tooltip_location')}
          currentDate={pollenSelected.defaultBaseDate}
          pollenSelected={pollenSelected.apiKey}
        />
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
        <PollenSelector
          value={pollenSelected}
          onChange={handlePollenChange}
          onToggle={(open) => setSelectorOpen(open)}
        />
      </span>

      {!selectorOpen && showPollenDetailsChart && (
        <PollenDetailsChart
          onClose={() => setShowPollenDetailsChart(false  )}
          currentDate={pollenSelected.defaultBaseDate}
          pollenSelected={pollenSelected.apiKey}
          loading={chartLoading}
        />
      )}
      <div className="absolute bottom-13 sm:bottom-13 md:bottom-13 left-1/2 -translate-x-1/2 z-50">
        <PollenTimeline
          setPlaying={setPlaying}
          playing={playing}
          activeHour={selectedHour}
          onHourChange={handleSliderChange}
          baseDate={pollenSelected.defaultBaseDate}
        />
      </div>

      <div
        className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 2xl:left-10 2xl:translate-x-0 2xl:bottom-14"
        onMouseEnter={() => setLegendOpen(true)}
        onMouseLeave={() => setLegendOpen(false)}
      >
        <PollenLegend width={350} height={25} />
      </div>

      <div className="fixed left-10 bottom-40 2xl:bottom-24">
        <PollenLegendCard
          open={legendOpen}
          levels={getLevelsForLegend(pollenSelected.apiKey)}
          cardRef={legendCardRef}
        />
      </div>

      {loading && <LoadingOverlay message={t('message_loading')} />}
    </div>
  );
};

export default ForecastMapContainer;
