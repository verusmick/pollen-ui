'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import { NowCastingMap } from '@/app/now-casting/components';
import {
  DropdownSelector,
  LoadingOverlay,
  LocationButton,
  LocationSearch,
  PanelHeader,
  PollenLegend,
  PollenLegendCard,
  SearchCardToggle,
} from '@/app/components';

import { useCurrentLocationStore } from '@/app/stores';
import {
  DEFAULT_POLLEN,
  getLevelsForLegend,
  POLLEN_ENTRIES,
  PollenConfig,
} from '@/app/now-casting/constants';
import { getRegionBounds } from '@/app/constants';
import { useNowCasting } from '@/app/now-casting/hooks';

export const NowCastingMapContainer = () => {
  const pathname = usePathname();
  const t = useTranslations('nowCastingPage');
  const tSearch = useTranslations('forecastPage.search');
  const tLocation = useTranslations('forecastPage.show_your_location');

  const [gridCellsResolution, setGridCellsResolution] = useState(0.008);
  const [pollenSelected, setPollenSelected] =
    useState<PollenConfig>(DEFAULT_POLLEN);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [pollenData, setPollenData] = useState<
    Array<[long: number, lat: number, value: number | null]>
  >([]);

  const legendCardRef = useRef<HTMLDivElement>(null);
  const { clearLocation: clearCurrentLocation } = useCurrentLocationStore();
  const { data: mapData, loading, fetchNowCasting } = useNowCasting();

  const isMapReady = !loading && pollenData.length > 0;

  useEffect(() => {
    fetchNowCasting({
      date: '2025-03-10',
      hour: 15,
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
    const latsCount = latitudes.length;
    const values = data.map((nowCasting: string | number, index: number) => {
      let value = nowCasting === '' ? null : Math.round(Number(nowCasting));
      if (value !== null) {
        if (value >= 1 && value <= 30) value = 2;
        else if (value >= 31 && value <= 100) value = 4;
        else if (value >= 101 && value <= 200) value = 6;
        else if (value >= 201 && value <= 400) value = 8;
        else if (value > 400) value = 9;
      }
      return [
        latitudes[index % latsCount],
        longitudes[Math.floor(index / latsCount)],
        value,
      ] as [number, number, number | null];
    });

    setPollenData(values);
  };

  const handlePollenChange = (newPollen: PollenConfig) => {
    setPollenSelected(newPollen);
  };

  return (
    <div className="relative h-screen w-screen">
      <NowCastingMap
        pollenData={pollenData}
        gridCellsResolution={gridCellsResolution}
        userLocation={userLocation}
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

        {/* <LocationButton
          tooltipText={tLocation('title_tooltip_location')}
          currentDate={pollenSelected.defaultBaseDate}
          pollenSelected={pollenSelected.apiKey}
          onLocationRetrieved={(coords) => setUserLocation(coords)}
        /> */}
      </span>

      <div className="absolute top-8 left-8 z-50 flex flex-col gap-4">
        <PanelHeader title={t('title')} iconSrc="/zaum.png" />
        <DropdownSelector
          value={pollenSelected}
          onChange={handlePollenChange}
          onToggle={(open) => setSelectorOpen(open)}
          options={POLLEN_ENTRIES.map((entry) => entry as PollenConfig)}
          getLabel={(item) => item.label}
          getKey={(item) => item.apiKey}
        />
      </div>

      <div
        className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 2xl:left-8 2xl:translate-x-0 2xl:bottom-14"
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

      {!isMapReady && <LoadingOverlay message={t('message_loading')} />}
    </div>
  );
};

export default NowCastingMapContainer;
