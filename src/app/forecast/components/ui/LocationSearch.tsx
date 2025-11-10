'use client';
import { useSearchLocationStore } from '@/app/forecast/stores/searchLocationStore';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { BiSearch, BiX } from 'react-icons/bi';
import {
  usePartialLoadingStore,
  usePollenDetailsChartStore,
} from '@/app/forecast/stores';
import { fetchAndShowPollenChart } from '@/app/forecast/utils';

export const LocationSearch = ({
  onSelect,
  open,
  currentDate,
  pollenSelected,
}: {
  onSelect: (pos: { lat: number; lng: number }) => void;
  open: boolean;
  currentDate: string;
  pollenSelected: string;
}) => {
  const t = useTranslations('forecastPage.search');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const { setChartLoading } = usePartialLoadingStore();
  const setLocation = useSearchLocationStore((state) => state.setLocation);
  const { setShow: setShowPollenDetailsChart } = usePollenDetailsChartStore();

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
              q: query,
              format: 'json',
              addressdetails: '1',
              limit: '8',
              countrycodes: 'de',
              viewbox: '9.5000,47.2700,13.8000,50.5667',
              bounded: '1',
            })
        );
        const data = await res.json();
        setSuggestions(data);
        setHighlightIndex(data.length > 0 ? 0 : -1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  // Focus when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.children[
        highlightIndex
      ] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightIndex]);
  // Function to select a suggestion
  const handleSelect = async (item: any) => {
    const selected = {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      name: item.display_name,
      boundingbox: item.boundingbox,
    };

    setLocation(selected);
    onSelect(selected);
    setQuery(item.display_name);
    setSuggestions([]);

    try {
      setChartLoading(true);
      await fetchAndShowPollenChart({
        lat: selected.lat,
        lng: selected.lng,
        pollen: pollenSelected,
        date: currentDate,
        setShowPollenDetailsChart,
      });
      setChartLoading(false);
    } catch (error) {
      console.error('Error cargando datos del gráfico:', error);
    }
  };

  // Keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightIndex]);
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-2">
      {/* Input */}
      <div className="relative">
        <BiSearch
          className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        {query && (
          <BiX
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            size={18}
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setHighlightIndex(-1);
            }}
          />
        )}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder_input_search')}
          className="w-full pl-8 pr-8 py-1 rounded-md bg-neutral-900/70 text-white focus:outline-none cursor-pointer"
        />
      </div>

      {/* Loading */}
      {loading && <div className="text-white text-base">{t('loading')}</div>}

      {/* No results */}
      {!loading && query && suggestions.length === 0 && (
        <div className="text-white text-base opacity-80">{t('no_results')}</div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="list-none flex flex-col gap-1 max-h-[50vh] overflow-auto search-scroll"
        >
          {suggestions.map((item, index) => {
            const display = item.display_name;
            const regex = new RegExp(`(${query})`, 'gi');
            const parts = display.split(regex);

            const isHighlighted = index === highlightIndex;

            return (
              <li
                key={item.place_id}
                className={`px-3 py-2 rounded-lg cursor-pointer transition ${
                  isHighlighted
                    ? 'bg-neutral-600 text-white'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-gray-200'
                }`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                {parts.map((part: string, i: number) =>
                  part.toLowerCase() === query.toLowerCase() ? (
                    <span
                      key={i}
                      className="underline font-bold text-indigo-400"
                    >
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
