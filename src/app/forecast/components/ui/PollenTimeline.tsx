'use client';

import { useEffect, useMemo, useRef } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface Props {
  setPlaying: (playing: boolean | ((p: boolean) => boolean)) => void;
  playing: boolean;
  activeHour: number;
  onHourChange: (hour: number) => void;
}

export default function PollenTimeline({
  setPlaying,
  activeHour,
  onHourChange,
  playing,
}: Props) {
  const barRef = useRef<HTMLDivElement>(null);

  // Generate 48 hours starting from 00:00 today
  const hours = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );

    const list: { label: string; date: string; hour: number }[] = [];

    for (let i = 0; i < 48; i++) {
      const d = new Date(startOfToday.getTime() + i * 3600 * 1000);
      const hourStr = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const dateStr = d.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
      });
      list.push({ label: hourStr, date: dateStr, hour: i });
    }
    return list;
  }, []);

  // Scroll to active hour
  useEffect(() => {
    if (barRef.current) {
      const activeEl = barRef.current.children[activeHour] as HTMLElement;
      activeEl?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }, [activeHour]);

  return (
    <div className="bg-card text-white rounded-lg shadow-md p-3 w-full max-w-3xl mx-auto backdrop-blur-sm search-scroll">
      <div className="flex items-center gap-2">
        {/* Play / Pause */}
        <button
          onClick={() => setPlaying((p) => !p)}
          className="p-2 bg-neutral-700/40 rounded hover:bg-slate-700 transition flex-shrink-0"
        >
          {playing ? <FaPause size={14} /> : <FaPlay size={14} />}
        </button>

        {/* Step backward */}
        <button
          onClick={() =>
            onHourChange(activeHour === 0 ? hours.length - 1 : activeHour - 1)
          }
          className="p-2 bg-neutral-700/40 rounded hover:bg-slate-700 transition flex-shrink-0"
        >
          <MdChevronLeft size={18} />
        </button>

        {/* Timeline */}
        <div
          ref={barRef}
          className="relative flex overflow-x-auto gap-[2px] scrollbar-hide flex-1 border-t border-gray-700 pt-2 px-1 sm:px-2 md:px-4"
        >
          {hours.map((h, i) => (
            <div
              key={i}
              className="flex flex-col items-center relative min-w-[32px] sm:min-w-[40px] md:min-w-[48px] lg:min-w-[60px]"
            >
              {/* Hour bar */}
              <div
                className={`h-2 w-full rounded-sm ${
                  i <= activeHour ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              />
              {/* Hour label */}
              <span
                className={`text-[10px] sm:text-[11px] md:text-[12px] mt-1 ${
                  i === activeHour
                    ? 'text-white font-semibold'
                    : 'text-gray-400'
                }`}
              >
                {h.label}
              </span>
              {/* Date label only when date changes */}
              {(i === 0 || hours[i].date !== hours[i - 1]?.date) && (
                <span className="text-[10px] text-gray-500 -mt-1">
                  {h.date}
                </span>
              )}
              {/* Clickable overlay */}
              <button
                className="absolute inset-0 w-full h-full opacity-0"
                onClick={() => onHourChange(i)}
              />
            </div>
          ))}
        </div>

        {/* Step forward */}
        <button
          onClick={() => onHourChange((activeHour + 1) % hours.length)}
          className="p-2 bg-neutral-700/40 rounded hover:bg-slate-700 transition flex-shrink-0"
        >
          <MdChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
