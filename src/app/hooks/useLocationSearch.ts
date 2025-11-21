  'use client';
  import { useState, useEffect, useRef } from 'react';
  import { useSearchLocationStore } from '@/app/stores/map/searchLocationStore';
  import { usePollenDetailsChartStore } from '@/app/forecast/stores';
  import { fetchAndShowPollenChart } from '@/app/forecast/utils';
  import { usePartialLoadingStore } from '@/app/stores';

  export const useLocationSearch = ({
    currentDate,
    pollenSelected,
    boundary,
    onSelect,
    nominatimApi,
  }: {
    currentDate: string;
    pollenSelected: string;
    boundary: [number, number, number, number];
    onSelect: (pos: { lat: number; lng: number }) => void;
    nominatimApi: string;
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState<number>(-1);

    const setLocation = useSearchLocationStore((state) => state.setLocation);
    const { setShow: setShowPollenDetailsChart } = usePollenDetailsChartStore();
    const { setChartLoading } = usePartialLoadingStore();

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
      } catch (err) {
        console.error(err);
      }
    };

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

    const fetchSuggestions = async (q: string) => {
      setLoading(true);
      try {
        const res = await fetch(
          `${nominatimApi}/search?` +
            new URLSearchParams({
              q,
              format: 'json',
              addressdetails: '1',
              limit: '8',
              countrycodes: 'de',
              viewbox: `${boundary[0]},${boundary[1]},${boundary[2]},${boundary[3]}`,
              bounded: '1',
            }),
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSuggestions(data);
        setHighlightIndex(data.length > 0 ? 0 : -1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (!query) {
        setSuggestions([]);
        return;
      }
      const timeout = setTimeout(() => fetchSuggestions(query), 400);
      return () => clearTimeout(timeout);
    }, [query]);

    const scrollToHighlightedItem = () => {
      if (highlightIndex >= 0 && listRef.current) {
        const activeItem = listRef.current.children[
          highlightIndex
        ] as HTMLElement;
        activeItem?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    };

    useEffect(() => scrollToHighlightedItem(), [highlightIndex]);

    return {
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
    };
  };
