'use client';

import { CastingMap } from '@/app/casting/components';
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
import { usePartialLoadingStore } from '@/app/forecast/stores';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export const CastingMapContainer = () => {
  const t = useTranslations('castingPage');
  const tSearch = useTranslations('forecastPage.search');
  const tLocation = useTranslations('forecastPage.show_your_location');
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
  return (
    <div className="relative h-screen w-screen">
      <CastingMap />
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

export default CastingMapContainer;
