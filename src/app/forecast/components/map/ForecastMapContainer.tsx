'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';

import { usePollenDetailsChartStore } from '@/app/forecast/stores';

import {
  ForecastMap,
  PollenLegend,
  PollenLegendCard,
  PollenTimeline,
} from '@/app/forecast/components';

import {
  DEFAULT_POLLEN,
  getLevelsForLegend,
  getRegionBounds,
  type PollenConfig,
} from '@/app/forecast/constants';

import {
  useHourlyForecast,
  usePollenPlayback,
  usePollenCacheManager,
  usePollenPrefetch,
} from '@/app/forecast/hooks';
import {
  computeResFromZoom,
  fetchAndShowPollenChart,
  getGridCellsResolution,
} from '@/app/forecast/utils';
import {
  LoadingSpinner,
  PanelHeader,
  LoadingOverlay,
  DropdownSelector,
  LocationSearch,
  SearchCardToggle,
  LocationButton,
} from '@/app/components';
import {
  useCoordinatesStore,
  useLoadingStore,
  usePartialLoadingStore,
} from '@/app/stores';

const PollenDetailsChart = dynamic(
  () =>
    import('../ui/PollenDetailsChart').then((mod) => mod.PollenDetailsChart),
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
  const [timelineStartHour, setTimelineStartHour] = useState(0);
  const [timelineHasWrapped, setTimelineHasWrapped] = useState(false);

  const legendCardRef = useRef<HTMLDivElement>(null);
  const pollenKeyRef = useRef(pollenSelected.apiKey);
  const { getCached, saveCache, pruneCache } = usePollenCacheManager();
  const { prefetchNextHours } = usePollenPrefetch();
  const [boundaryMapBox, setBoundaryMapBox] = useState(getRegionBounds());

  const [gridCellsResolution, setGridCellsResolution] = useState(0.02);
  const [resolution, setResolution] = useState<1 | 2 | 3>(1);

  const handlePlayPause = () => {
    if (!playing) {
      setTimelineStartHour(selectedHour);
      setTimelineHasWrapped(false);
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  };

  const forecastParams = useMemo(
    () => ({
      date: pollenSelected.defaultBaseDate,
      hour: selectedHour,
      pollen: pollenSelected.apiKey,
      box: boundaryMapBox.join(','),
      intervals: pollenSelected.apiIntervals,
      includeCoords: true,
      res: resolution,
    }),
    [pollenSelected, selectedHour, boundaryMapBox]
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
    onNextHour: () => {
      setSelectedHour((prevHour) => {
        const nextHour = prevHour + 1;
        if (!timelineHasWrapped && nextHour > 47) {
          setTimelineHasWrapped(true);
          return 0;
        }
        if (timelineHasWrapped && nextHour > timelineStartHour) {
          setPlaying(false);
          return prevHour;
        }
        return nextHour;
      });
    },

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

  const handleMapDataUpdate = () => {
    const pollenKey = pollenSelected.apiKey;
    const cached = getCached(pollenKey, selectedHour);

    if (cached) {
      setPollenData(cached);
      prefetchNextHours(forecastParams, selectedHour, 3);
      setPartialLoading(false);
      return;
    }

    const { data, longitudes = [], latitudes = [] } = mapData;
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
  };

  const handleRegionChange = useCallback(
    ({
      bBox,
      zoom,
    }: {
      bBox: [number, number, number, number];
      zoom: number;
    }) => {
      pruneCache(pollenKeyRef.current, selectedHour, 2);

      const newRes = computeResFromZoom(zoom);
      const newGridCellsResolution = getGridCellsResolution(newRes);

      setResolution(newRes);
      setGridCellsResolution(newGridCellsResolution);
      setBoundaryMapBox(bBox);
    },
    [selectedHour, pruneCache]
  );

  useEffect(() => {
    if (!mapData) return;

    handleMapDataUpdate();
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

  useEffect(() => {
    pollenKeyRef.current = pollenSelected.apiKey;
  }, [pollenSelected.apiKey]);

  return (
    <main className="flex-1 bg-gray-100 overflow-auto min-h-0">
      <ForecastMap
        pollenData={pollenData}
        onRegionChange={handleRegionChange}
        pollenSelected={pollenSelected.apiKey}
        currentDate={pollenSelected.defaultBaseDate}
        gridCellsResolution={gridCellsResolution}
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
              boundary={getRegionBounds()}
            />
          )}
        </SearchCardToggle>

        <LocationButton
          tooltipText={tLocation('title_tooltip_location')}
          currentDate={pollenSelected.defaultBaseDate}
          pollenSelected={pollenSelected.apiKey}
        />
      </span>
      <div className="absolute top-8 left-8 z-50 flex flex-col gap-4">
        <PanelHeader title={t('title')} iconSrc="/zaum.png" />
        {partialLoading && (
          <div className="fixed inset-0 flex justify-center items-center bg-card/70 z-100">
            <LoadingSpinner size={40} color="border-white" />
          </div>
        )}
        <DropdownSelector
          value={pollenSelected}
          onChange={handlePollenChange}
          onToggle={(open) => setSelectorOpen(open)}
        />
        {showPollenDetailsChart && !selectorOpen && (
          <PollenDetailsChart
            onClose={() => setShowPollenDetailsChart(false)}
            currentDate={pollenSelected.defaultBaseDate}
            pollenSelected={pollenSelected.apiKey}
            loading={chartLoading}
          />
        )}
      </div>

      <div className="absolute bottom-16 sm:bottom-16 md:bottom-13 left-1/2 -translate-x-1/2 z-50">
        <PollenTimeline
          setPlaying={handlePlayPause}
          playing={playing}
          activeHour={selectedHour}
          onHourChange={handleSliderChange}
          baseDate={pollenSelected.defaultBaseDate}
        />
      </div>

      <div
        className="absolute z-50 bottom-4 left-1/2 -translate-x-1/2 2xl:left-8 2xl:translate-x-0 2xl:bottom-13"
        onMouseEnter={() => setLegendOpen(true)}
        onMouseLeave={() => setLegendOpen(false)}
      >
        <PollenLegend width={300} height={25} />
      </div>

      <div className="absolute left-8 bottom-40 2xl:bottom-24">
        <PollenLegendCard
          open={legendOpen}
          levels={getLevelsForLegend(pollenSelected.apiKey)}
          cardRef={legendCardRef}
        />
      </div>

      {loading && <LoadingOverlay message={t('message_loading')} />}
    </main>
  );
};

export default ForecastMapContainer;
