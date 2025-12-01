'use client';

import { NowCastingMap } from '@/app/now-casting/components';
import {
  DropdownSelector,
  LocationButton,
  LocationSearch,
  PanelHeader,
  SearchCardToggle,
} from '@/app/components';
import {
  DEFAULT_POLLEN,
  getRegionBounds,
  PollenConfig,
} from '@/app/forecast/constants';
import { usePartialLoadingStore } from '@/app/stores';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useNowCasting } from '../hook/useNowCasting';

export const NowCastingMapContainer = () => {
  const t = useTranslations('now_castingPage');
  const tSearch = useTranslations('forecastPage.search');
  const tLocation = useTranslations('forecastPage.show_your_location');
  const [gridCellsResolution, setGridCellsResolution] = useState(0.02);
  const [pollenSelected, setPollenSelected] =
    useState<PollenConfig>(DEFAULT_POLLEN);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const { partialLoading, setPartialLoading, chartLoading, setChartLoading } =
    usePartialLoadingStore();
  const boundaryMapBox = getRegionBounds();
  const handlePollenChange = (newPollen: PollenConfig) => {
    setPartialLoading(true);
    setPollenSelected(newPollen);
  };
  const [pollenData, setPollenData] = useState<
    Array<[long: number, lat: number, value: number]>
  >([]);
  const { data: mapData, loading, error, fetchNowCasting } = useNowCasting();
  useEffect(() => {
    fetchNowCasting({
      date: '2025-05-11',
      hour: '12',
      pollen: 'POLLEN_PINACEAE',
      include_coords: true,
    });
  }, []);
  const handleMapDataUpdate = () => {
    const { data, longitudes = [], latitudes = [] } = mapData;
    const latsCount = latitudes.length;
    const values = data.map(
      (nowCasting: number, index: number) =>
        [
          latitudes[index % latsCount],
          longitudes[Math.floor(index / latsCount)],
          nowCasting / 10,
        ] as [number, number, number]
    );
    setPollenData(values);
  };
  useEffect(() => {
    if (!mapData) return;

    handleMapDataUpdate();
  }, [mapData]);

  return (
    <div className="relative h-screen w-screen">
      <NowCastingMap
        pollenData={pollenData}
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
              boundary={boundaryMapBox}
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
        <DropdownSelector
          value={pollenSelected}
          onChange={handlePollenChange}
          onToggle={(open) => setSelectorOpen(open)}
        />
      </div>
    </div>
  );
};

export default NowCastingMapContainer;
