'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import { NowCastingMap, PollenTimeline } from '@/app/now-casting/components';
import {
  DropdownSelector,
  LoadingOverlay,
  LoadingSpinner,
  PanelHeader,
  PollenLegend,
  PollenLegendCard,
  SearchCardToggle,
} from '@/app/components';

import {
  useCoordinatesStore,
  useCurrentLocationStore,
  useLoadingStore,
  usePartialLoadingStore,
} from '@/app/stores';
import {
  DEFAULT_POLLEN,
  getLevelsForLegend,
  POLLEN_ENTRIES,
  PollenConfig,
} from '@/app/now-casting/constants';
import { getRegionBounds } from '@/app/constants';
import {
  useHourlyNowCasting,
  usePollenCacheManager,
  usePollenPlayback,
  usePollenPrefetch,
} from '@/app/now-casting/hooks';
import { useSidebar } from '@/app/context';
import { useIsLargeScreen } from '@/app/hooks';
import { PollenDetailsChart } from '@/app/forecast/components';
import { usePollenDetailsChartStore } from '@/app/forecast/stores';
import { buildHourTimeline, type HourPoint } from '@/app/now-casting/utils';

export const NowCastingMapContainer = () => {
  const pathname = usePathname();
  const t = useTranslations('nowCastingPage');

  const [playing, setPlaying] = useState(false);
  const [selectedHour, setSelectedHour] = useState<HourPoint>();

  const [timelineStartHour, setTimelineStartHour] = useState(0);
  const [timelineHasWrapped, setTimelineHasWrapped] = useState(false);
  const [gridCellsResolution, setGridCellsResolution] = useState(0.009);
  const [pollenSelected, setPollenSelected] =
    useState<PollenConfig>(DEFAULT_POLLEN);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const { show: showPollenDetailsChart, setShow: setShowPollenDetailsChart } =
    usePollenDetailsChartStore();
  const [pollenData, setPollenData] = useState<
    Array<[long: number, lat: number, value: number | null]>
  >([]);
  const [resolution, setResolution] = useState<1 | 2 | 3>(1);
  const [boundaryMapBox, setBoundaryMapBox] = useState(getRegionBounds());

  const legendCardRef = useRef<HTMLDivElement>(null);

  const { loading, setLoading } = useLoadingStore();
  const { clearLocation: clearCurrentLocation } = useCurrentLocationStore();
  const { partialLoading, setPartialLoading, chartLoading, setChartLoading } =
    usePartialLoadingStore();
  const { sidebarWidth } = useSidebar();
  const isLargeScreen = useIsLargeScreen();
  const { getCached, saveCache, pruneCache } = usePollenCacheManager();
  const { prefetchNextHours } = usePollenPrefetch();
  const { nowCasting } = useCoordinatesStore();
  const { setLatitudes, setLongitudes } = nowCasting;

  const nowCastingParams = useMemo(
    () => ({
      date: selectedHour?.apiDate,
      hour: selectedHour?.apiHour,
      pollen: pollenSelected.apiKey,
      box: boundaryMapBox.join(','),
      intervals: pollenSelected.apiIntervals,
      includeCoords: true,
      res: resolution,
    }),
    [pollenSelected, boundaryMapBox, selectedHour]
  );

  const {
    data: mapData,
    isFetching,
    isLoading: mapDataIsLoading,
  } = useHourlyNowCasting(nowCastingParams);

  const handleMapDataUpdate = () => {
    const pollenKey = pollenSelected.apiKey;
    // const cached = getCached(pollenKey, selectedHour);

    // if (cached) {
    //   setPollenData(cached);
    //   // prefetchNextHours(nowCastingParams, selectedHour, 3);
    //   setPartialLoading(false);
    //   return;
    // }

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

    // saveCache(pollenKey, selectedHour, values);
    // pruneCache(pollenKey, selectedHour, 2);
    setPollenData(values);

    // prefetchNextHours(nowCastingParams, selectedHour, 3);
    setPartialLoading(false);
  };

  const handlePollenChange = (newPollen: PollenConfig) => {
    setPartialLoading(true);
    setPollenSelected(newPollen);
  };

  const handlePlayPause = () => {
    if (!playing) {
      setTimelineStartHour(selectedHour);
      setTimelineHasWrapped(false);
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  };

  const handleSliderChange = useCallback((newHour: HourPoint) => {
    setPlaying(false);
    setSelectedHour(newHour);
  }, []);

  usePollenPlayback({
    playing,
    isFetching,
    isLoading: mapDataIsLoading,
    onNextHour: () => {
      console.log('onNextHour');
      setSelectedHour((prevHour) => {
        const nextHour = prevHour + 3;
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

  const { hours: timelineHours } = useMemo(
    () =>
      buildHourTimeline({
        baseDate: pollenSelected.defaultBaseDate,
        intervalHours: 3,
        totalHours: 48,
      }),
    [pollenSelected.defaultBaseDate]
  );

  useEffect(() => {
    if (!mapDataIsLoading) setLoading(false);
  }, [mapDataIsLoading]);

  useEffect(() => {
    if (!mapData) return;
    handleMapDataUpdate();
  }, [mapData]);

  useEffect(() => {
    clearCurrentLocation();
    setUserLocation(null);
  }, [pathname]);

  useEffect(() => {
    if (!mapDataIsLoading) setLoading(false);
  }, [mapDataIsLoading]);

  useEffect(() => {
    handleSliderChange(timelineHours[timelineHours.length - 1]);
  }, []);

  useEffect(() => {
    usePollenDetailsChartStore.getState().setShow(false, '', null, null, null);
    usePollenDetailsChartStore.getState().latitude = null;
    usePollenDetailsChartStore.getState().longitude = null;
  }, []);

  return (
    <div className="relative h-screen w-screen">
      <NowCastingMap
        pollenData={pollenData}
        gridCellsResolution={gridCellsResolution}
        userLocation={userLocation}
        pollenSelected={pollenSelected.apiKey}
        currentDate={pollenSelected.defaultBaseDate}
      />
      <span className="absolute top-8 right-6 z-50 flex flex-col items-start gap-2">
        {/* <SearchCardToggle title={tSearch('title_tooltip_search')}>
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
        </SearchCardToggle> */}

        {/* <LocationButton
          tooltipText={tLocation('title_tooltip_location')}
          currentDate={pollenSelected.defaultBaseDate}
          pollenSelected={pollenSelected.apiKey}
          onLocationRetrieved={(coords) => setUserLocation(coords)}
        /> */}
      </span>
      <div
        className="absolute top-8 z-50 flex flex-col gap-4 transition-all duration-300"
        style={{ left: 30 + sidebarWidth }}
      >
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
          options={POLLEN_ENTRIES.map((entry) => entry as PollenConfig)}
          getLabel={(item) => item.label}
          getKey={(item) => item.apiKey}
        />
        {showPollenDetailsChart && !selectorOpen && (
          <PollenDetailsChart
            onClose={() => setShowPollenDetailsChart(false)}
            currentDate={pollenSelected.defaultBaseDate}
            pollenSelected={pollenSelected.apiKey}
            loading={chartLoading}
            view="nowcasting"
          />
        )}
      </div>

      <div
        className="absolute bottom-16 sm:bottom-16 md:bottom-13 left-1/2 z-40 transition-all duration-300"
        style={{
          transform: isLargeScreen
            ? `translateX(calc(-50% + ${sidebarWidth}px))`
            : 'translateX(-50%)',
        }}
      >
        <PollenTimeline
          setPlaying={handlePlayPause}
          playing={playing}
          activeHour={selectedHour?.hourIndex || 0}
          onHourChange={handleSliderChange}
          baseDate={pollenSelected.defaultBaseDate}
          intervalHours={3}
          alignToCurrentTime={true}
          hours={timelineHours}
        />
      </div>

      <div
        className="absolute z-50 transition-all duration-300"
        style={{
          bottom: isLargeScreen ? 50 : 16,
          left: isLargeScreen
            ? sidebarWidth > 0
              ? `${sidebarWidth + 30}px`
              : '30px'
            : '50%',
          transform: isLargeScreen ? 'translateX(0)' : 'translateX(-50%)',
        }}
        onMouseEnter={() => setLegendOpen(true)}
        onMouseLeave={() => setLegendOpen(false)}
      >
        <PollenLegend width={300} height={25} />
      </div>

      <div
        className="absolute transition-all duration-300"
        style={{ left: 30 + sidebarWidth, bottom: isLargeScreen ? 100 : 70 }}
      >
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

export default NowCastingMapContainer;
