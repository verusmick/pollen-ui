'use client';
import { useLocationSearch } from '@/app/hooks';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { BiSearch, BiX } from 'react-icons/bi';

interface LocationSearchProps {
  onSelect: (pos: { lat: number; lng: number }) => void;
  open: boolean;
  currentDate: string;
  pollenSelected: string;
  boundary: [number, number, number, number];
}

export const LocationSearch = ({
  onSelect,
  open,
  currentDate,
  pollenSelected,
  boundary,
}: LocationSearchProps) => {
  const t = useTranslations('Components.search');
  const nominatimApi = process.env.NEXT_PUBLIC_NOMINATIM_API!;

  const {
    query,
    setQuery,
    suggestions,
    loading,
    highlightIndex,
    setHighlightIndex,
    handleKeyDown,
    handleSelect,
    inputRef,
    listRef,
  } = useLocationSearch({
    currentDate,
    pollenSelected,
    boundary,
    onSelect,
    nominatimApi,
  });

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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
