'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  DropdownSelector,
  LoadingOverlay,
  LoadingSpinner,
  PanelHeader,
  PollenLegend,
  PollenLegendCard,
  PollenTimeline,
  SearchCardToggle,
} from '@/app/components';

import {
  useCoordinatesStore,
  useCurrentLocationStore,
  usePartialLoadingStore,
} from '@/app/stores';
import {
  DEFAULT_POLLEN,
  getLevelsForLegend,
  POLLEN_ENTRIES,
  PollenConfig,
} from '@/app/now-casting/constants';
import { useNowCasting } from '@/app/now-casting/hooks';
import { useSidebar } from '@/app/context';
import { useIsLargeScreen, usePollenChart } from '@/app/hooks';
import { PollenDetailsChart } from '@/app/forecast/components';
import { usePollenDetailsChartStore } from '@/app/forecast/stores';
import NowCastingMap from './NowCastingMap';

export const NowCastingMapContainer = () => {
  const pathname = usePathname();
  const t = useTranslations('nowCastingPage');

  const [playing, setPlaying] = useState(false);
  const [selectedHour, setSelectedHour] = useState(0);
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
  const { sidebarWidth } = useSidebar();
  const isLargeScreen = useIsLargeScreen();
  const { show: showPollenDetailsChart, setShow: setShowPollenDetailsChart } =
    usePollenDetailsChartStore();
  const [pollenData, setPollenData] = useState<
    Array<[number, number, number | undefined]>
  >([]);
  const legendCardRef = useRef<HTMLDivElement>(null);
  const { clearLocation: clearCurrentLocation } = useCurrentLocationStore();
  const { partialLoading, setPartialLoading, chartLoading, setChartLoading } =
    usePartialLoadingStore();
  const { data: mapData, loading, fetchNowCasting } = useNowCasting();
  const { fetchChart } = usePollenChart();
  const { nowCasting } = useCoordinatesStore();
  const { setLatitudes, setLongitudes } = nowCasting;
  useEffect(() => {
    setPartialLoading(true);
    fetchNowCasting({
      date: pollenSelected.defaultBaseDate,
      hour: pollenSelected.defaultHour,
      pollen: pollenSelected.apiKey,
      includeCoords: true,
    });
  }, []);

  useEffect(() => {
    if (!mapData) return;

    handleMapDataUpdate();
  }, [mapData]);

  useEffect(() => {
    clearCurrentLocation();
    setUserLocation(null);
  }, [pathname]);

  const handleMapDataUpdate = () => {
    if (!mapData) return;

    const { data, longitudes = [], latitudes = [] } = mapData;
    setLongitudes(longitudes);
    setLatitudes(latitudes);
    const latsCount = latitudes.length || 1;

    const values = data.map((nowCasting: string | number, index: number) => {
      let value =
        nowCasting === '' ? undefined : Math.round(Number(nowCasting));
      if (value !== undefined) {
        if (value >= 1 && value <= 30) value = 2;
        else if (value >= 31 && value <= 100) value = 4;
        else if (value >= 101 && value <= 200) value = 6;
        else if (value >= 201 && value <= 400) value = 8;
        else if (value > 400) value = 9;
      }

      const lat = latitudes[index % latsCount] ?? 0;
      const lon = longitudes[Math.floor(index / latsCount)] ?? 0;

      return [lat, lon, value] as [number, number, number | undefined];
    });

    setPollenData(values);
  };

  const loadPollenChart = async () => {
    const { latitude, longitude } = usePollenDetailsChartStore.getState();
    if (!latitude || !longitude) return;

    setChartLoading(true);
    try {
      await fetchChart({
        lat: latitude,
        lng: longitude,
        pollen: pollenSelected.apiKey,
        date: pollenSelected.defaultBaseDate,
        nowcasting: { hour: pollenSelected.defaultHour, nhours: 48 },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setChartLoading(false);
    }
  };

  const handlePollenChange = (newPollen: PollenConfig) => {
    setPartialLoading(true);
    setPollenSelected(newPollen);

    fetchNowCasting({
      date: newPollen.defaultBaseDate,
      hour: newPollen.defaultHour,
      pollen: newPollen.apiKey,
      includeCoords: true,
    });

    requestAnimationFrame(() => {
      loadPollenChart();
    });
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

  const handleSliderChange = useCallback((hour: number) => {
    setPlaying(false);
    setSelectedHour(hour);
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

        {partialLoading && loading && (
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
          activeHour={selectedHour}
          onHourChange={handleSliderChange}
          baseDate={pollenSelected.defaultBaseDate}
          intervalHours={3}
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

      {loading && !mapData?.data?.length && (
        <LoadingOverlay message={t('message_loading')} />
      )}
    </div>
  );
};

export default NowCastingMapContainer;
