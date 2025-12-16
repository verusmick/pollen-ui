'use client';

import { useEffect, useMemo, useRef } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { type HourPoint } from '@/app/now-casting/utils';

interface Props {
  setPlaying: (playing: boolean | ((p: boolean) => boolean)) => void;
  playing: boolean;
  activeHour: number;
  onHourChange: (obj: HourPoint) => void;
  baseDate: string;
  intervalHours?: number;
  totalHours?: number;
  alignToCurrentTime?: boolean;
  hours: HourPoint[];
}

export default function PollenTimeline({
  setPlaying,
  activeHour,
  onHourChange,
  playing,
  baseDate,
  intervalHours = 1,
  totalHours = 48,
  alignToCurrentTime,
  hours = [],
}: Props) {
  const barRef = useRef<HTMLDivElement>(null);

  const handleHourNavigation = (direction: 'next' | 'prev') => {
    if (!hours.length) return;

    const currentIndex = hours.findIndex(
      (item) => item.hourIndex === activeHour
    );

    if (currentIndex === -1) return;

    const delta = direction === 'next' ? 1 : -1;
    const newIndex = (currentIndex + delta + hours.length) % hours.length;

    onHourChange(hours[newIndex]);
  };

  // Auto-scroll to active hour
  useEffect(() => {
    if (barRef.current) {
      const index = activeHour / intervalHours;
      const activeEl = barRef.current.children[index] as HTMLElement;
      activeEl?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }, [activeHour, intervalHours]);

  return (
    <div className="bg-card text-white rounded-lg shadow-md p-3 w-full max-w-2xl mx-auto backdrop-blur-sm search-scroll">
      <div className="flex items-center gap-2">
        {/* Play / Pause */}
        <button
          onClick={() => setPlaying((p) => !p)}
          className="p-2 bg-neutral-700/40 rounded hover:bg-slate-700 transition shrink-0"
        >
          {playing ? <FaPause size={14} /> : <FaPlay size={14} />}
        </button>

        {/* Step backward */}
        <button
          onClick={() => handleHourNavigation('prev')}
          className="p-2 bg-neutral-700/40 rounded hover:bg-slate-700 transition shrink-0"
        >
          <MdChevronLeft size={18} />
        </button>

        {/* Timeline */}
        <div
          ref={barRef}
          className="relative flex overflow-x-auto gap-0.5 scrollbar-hide flex-1 border-t border-gray-700 pt-2 pb-1 px-1 sm:px-2 md:px-4"
        >
          {hours.map((h, i) => (
            <div
              key={h.hourIndex}
              className="flex flex-col items-center relative min-w-8 sm:min-w-10 md:min-w-12 lg:min-w-[60px]"
            >
              {/* Hour bar */}
              <div
                className={`h-2 w-full rounded-sm ${
                  h.hourIndex <= activeHour ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              />
              {/* Hour label */}
              <span
                className={`text-[10px] sm:text-[11px] md:text-[12px] mt-1 ${
                  h.hourIndex === activeHour
                    ? 'text-white font-semibold'
                    : 'text-gray-400'
                }`}
              >
                {h.label}
              </span>
              {h.showDate && (
                <span className="text-[10px] text-gray-500 -mt-1">
                  {h.date}
                </span>
              )}
              {/* Clickable overlay */}
              <button
                className="absolute inset-0 w-full h-full opacity-0"
                onClick={() => onHourChange(h)}
              />
            </div>
          ))}
        </div>

        {/* Step forward */}
        <button
          onClick={() => handleHourNavigation('next')}
          className="p-2 bg-neutral-700/40 rounded hover:bg-slate-700 transition shrink-0"
        >
          <MdChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
