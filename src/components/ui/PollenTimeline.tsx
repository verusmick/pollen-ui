"use client";

import { useEffect, useRef } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

const hours = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
  "00:00",
  "01:00",
  "02:00",
];

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

  useEffect(() => {
    if (barRef.current) {
      const activeEl = barRef.current.children[activeHour] as HTMLElement;
      activeEl?.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  }, [activeHour]);

  return (
    <div className="bg-card text-white rounded-lg shadow-md p-3 w-full max-w-3xl mx-auto backdrop-blur-sm">
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
              key={h}
              className="flex flex-col items-center relative min-w-[32px] sm:min-w-[40px] md:min-w-[48px] lg:min-w-[60px]"
            >
              <div
                className={`h-2 w-full rounded-sm ${
                  i <= activeHour ? "bg-blue-500" : "bg-slate-700"
                }`}
              />
              <span
                className={`text-[10px] sm:text-[11px] md:text-[12px] mt-1 ${
                  i === activeHour
                    ? "text-white font-semibold"
                    : "text-gray-400"
                }`}
              >
                {h}
              </span>
              {/* Dividing line */}
              <div className="absolute top-0 left-full h-4 w-[1px] bg-gray-700"></div>
              {/* Overlay clicable */}
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
