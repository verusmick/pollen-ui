'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

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

import { DEFAULT_POLLEN, type PollenConfig } from '@/app/forecast/constants';
import { useHourlyForecast } from '../hooks/useHourlyForecast';

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
  const [currentBox, setCurrentBox] = useState<number[] | null>(null);

  const legendCardRef = useRef<HTMLDivElement>(null);
  const allDataRef = useRef<[long: number, lat: number, value: number][][]>([]);

  // const currentDate = new Date().toISOString().split('T')[0];
  // TODO: remove this hardcoded date when the API will be able
  const currentDate: string = pollenSelected.defaultBaseDate;

  const [playing, setPlaying] = useState(false);
  const [selectedHour, setSelectedHour] = useState(0);

  const {
    data: mapData,
    isFetching,
    isLoading: mapDataIsLoading,
  } = useHourlyForecast({
    date: currentDate,
    hour: selectedHour,
    pollen: pollenSelected.apiKey,
    // box: currentBox?.join(','),
    box: '7.7893676757813735,46.51390491298438,15.210632324218798,50.986455071208994',
    includeCoords: true,
  });

  const handlePollenChange = (newPollen: PollenConfig) => {
    setPollenSelected(newPollen);
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

  const handleRegionChange = useCallback((box: number[]) => {
    setCurrentBox(box);
  }, []);

  const setCurrentHourOnMount = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffHours = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60)
    );
    handleSliderChange(diffHours);
  };

  // Handle hour change
  const handleSliderChange = async (hour: number) => {
    setPlaying(false);
    setSelectedHour(hour);
    setPollenData(allDataRef.current[hour] || []);
  };

  // Playback
  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(async () => {
      const nextHour = (selectedHour + 1) % 48;
      setSelectedHour(nextHour);
      setPollenData(allDataRef.current[nextHour] || []);
    }, 1000);

    return () => clearInterval(interval);
  }, [playing, selectedHour]);

  useEffect(() => {
    if (!mapDataIsLoading) setLoading(false);
    // if (!loading) setPartialLoading(mapDataIsLoading);
  }, [mapDataIsLoading]);

  useEffect(() => {
    if (mapData) {
      const { data, longitudes, latitudes } = mapData;
      addNewPollenData(data, longitudes, latitudes, selectedHour);
    }
  }, [mapData]);

  // init
  useEffect(() => {
    // set Current Hour On Mount
    setCurrentHourOnMount();
  }, []);

  return (
    <div className="relative h-screen w-screen">
      {/* Main content */}
      <ForecastMap
        pollenData={pollenData}
        onRegionChange={handleRegionChange}
        pollenSelected={pollenSelected.apiKey}
        currentDate={currentDate}
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
        <PollenSelector value={pollenSelected} onChange={handlePollenChange} />
      </span>
      {!selectorOpen && showPollenDetailsChart && (
        <PollenDetailsChart
          onClose={() => setShowPollenDetailsChart(false, '', null, null, null)}
        />
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
