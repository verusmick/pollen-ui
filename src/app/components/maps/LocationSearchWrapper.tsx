'use client';

import { useTranslations } from 'next-intl';
import { SearchCardToggle, LocationSearch } from '@/app/components';
import { getRegionBounds } from '@/app/constants';

interface LocationSearchWrapperProps {
  pollenSelected: string;
  currentDate: string;
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
}

export const LocationSearchWrapper = ({
  pollenSelected,
  currentDate,
  onLocationSelect,
}: LocationSearchWrapperProps) => {
  const tSearch = useTranslations('Components.search');

  return (
    <SearchCardToggle title={tSearch('title_tooltip_search')}>
      {(toggleOpen, setToggleOpen) => (
        <LocationSearch
          open={toggleOpen}
          onSelect={(pos) => {
            onLocationSelect(pos);
            setToggleOpen(false);
          }}
          currentDate={currentDate}
          pollenSelected={pollenSelected}
          boundary={getRegionBounds()}
        />
      )}
    </SearchCardToggle>
  );
};
