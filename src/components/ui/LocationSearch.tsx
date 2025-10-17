"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiX } from "react-icons/bi";

export const LocationSearch = ({
  onSelect,
}: {
  onSelect: (pos: { lat: number; lng: number }) => void;
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )}&format=json&limit=5`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="relative w-full flex flex-col gap-2">
      {/* Input with icons */}
      <div className="relative">
        <BiSearch
          className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        {query && (
          <BiX
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            size={18}
            onClick={() => setQuery("")}
          />
        )}

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Location, Zip Code"
          className="w-full pl-8 pr-8 py-1 rounded-md bg-neutral-900/70 text-white focus:outline-none"
        />
      </div>

      {/* Loading */}
      {loading && <div className="text-white text-base">Loading...</div>}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <ul className="list-none flex flex-col gap-2 max-h-64 overflow-auto">
          {suggestions.map((item) => {
            const display = item.display_name;
            const regex = new RegExp(`(${query})`, "gi");
            const parts = display.split(regex);

            return (
              <li
                key={item.place_id}
                className="px-3 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 cursor-pointer shadow-sm"
                onClick={() => {
                  onSelect({
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon),
                  });
                  setQuery(item.display_name);
                  setSuggestions([]);
                }}
              >
                {parts.map((part: string, i: number) =>
                  part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="underline font-bold">
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
