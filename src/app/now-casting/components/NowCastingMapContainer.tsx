'use client';

import NowCastingMap from './NowCastingMap';

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
import { useState } from 'react';
import { useSidebar } from '@/app/context/SidebarContext';

export default function NowCastingMapContainer() {
  const t = useTranslations('now_castingPage');
  const tSearch = useTranslations('forecastPage.search');
  const tLocation = useTranslations('forecastPage.show_your_location');

  const { sidebarWidth } = useSidebar();
  const [pollenSelected, setPollenSelected] =
    useState<PollenConfig>(DEFAULT_POLLEN);

  const boundaryMapBox = getRegionBounds();
  const { setPartialLoading } = usePartialLoadingStore();

  const handlePollenChange = (newPollen: PollenConfig) => {
    setPartialLoading(true);
    setPollenSelected(newPollen);
  };

  return (
    <>
      <NowCastingMap />

      <span className="absolute top-8 right-6 z-50 flex flex-col items-start gap-2">
        <SearchCardToggle title={tSearch('title_tooltip_search')}>
          {(open, setOpen) => (
            <LocationSearch
              open={open}
              onSelect={(pos) => {
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

      <div
        className="absolute top-8 z-50 flex flex-col gap-4 transition-all duration-300"
        style={{ left: 30 + sidebarWidth }}
      >
        <PanelHeader title={t('title')} iconSrc="/zaum.png" />

        <DropdownSelector
          value={pollenSelected}
          onChange={handlePollenChange}
          options={[]}
          getLabel={(item) => item.label}
          getKey={(item) => item.apiKey}
        />
      </div>
    </>
  );
}
