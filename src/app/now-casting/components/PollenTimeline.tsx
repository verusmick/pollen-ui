'use client';

import dayjs from 'dayjs';
import { useEffect, useMemo, useRef } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface HourPoint {
  label: string;
  date: string;
  apiDate: string;
  apiHour: number;
  hourIndex: number;
  showDate: boolean;
}

interface Props {
  setPlaying: (playing: boolean | ((p: boolean) => boolean)) => void;
  playing: boolean;
  activeHour: number;
  onHourChange: (hourIndex: number, date: string, apiHour: number) => void;
  baseDate: string;
  intervalHours?: number;
  totalHours?: number;

  alignToCurrentTime?: boolean;
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
}: Props) {
  const barRef = useRef<HTMLDivElement>(null);

  const { start, hours } = useMemo(() => {
    const steps = totalHours / intervalHours;

    if (!alignToCurrentTime) {
      const startOfDay = dayjs(baseDate).startOf('day');
      const list: HourPoint[] = [];

      for (let i = 0; i < steps; i++) {
        const d = startOfDay.add(i * intervalHours, 'hour');

        list.push({
          label: d.format('HH:mm'),
          date: d.format('MMM D, YYYY'),
          apiDate: d.format('YYYY-MM-DD'),
          apiHour: d.hour(),
          hourIndex: i * intervalHours,
          showDate: i % Math.floor(6 / intervalHours) === 0,
        });
      }

      return { start: startOfDay, hours: list };
    }

    const now = dayjs();
    const base = dayjs(baseDate);
    const currentHour = now.hour();
    const alignedHour = currentHour - (currentHour % intervalHours);
    const end = base.hour(alignedHour).minute(0).second(0).millisecond(0);
    const start = end.subtract(totalHours - intervalHours, 'hour');
    const list: HourPoint[] = [];

    for (let i = 0; i < steps; i++) {
      const d = start.add(i * intervalHours, 'hour');

      list.push({
        label: d.format('HH:mm'),
        date: d.format('MMM D, YYYY'),
        apiDate: d.format('YYYY-MM-DD'),
        apiHour: d.hour(),
        hourIndex: i * intervalHours,
        showDate: i % Math.floor(6 / intervalHours) === 0,
      });
    }

    return { start, hours: list };
  }, [alignToCurrentTime, baseDate, intervalHours, totalHours]);

  const handleHourNavigation = (direction: 'next' | 'prev') => {
    if (!hours.length) return;

    const currentIndex = hours.findIndex(
      (item) => item.hourIndex === activeHour
    );

    if (currentIndex === -1) return;

    const delta = direction === 'next' ? 1 : -1;
    const newIndex = (currentIndex + delta + hours.length) % hours.length;

    const { hourIndex, apiDate, apiHour } = hours[newIndex];
    onHourChange(hourIndex, apiDate, apiHour);
  };

  // Auto-scroll to active hour
  useEffect(() => {
    if (barRef.current) {
      const index = activeHour / intervalHours;
      const activeEl = barRef.current.children[index] as HTMLElement;
      activeEl?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }, [activeHour, intervalHours]);
  useEffect(() => {
    const { hourIndex, apiDate, apiHour } = hours[hours.length - 1];
    onHourChange(hourIndex, apiDate, apiHour);
  }, []);

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
                onClick={() => onHourChange(h.hourIndex, h.apiDate, h.apiHour)}
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
