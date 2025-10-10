"use client";

import { useState, useEffect, useRef } from "react";
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
  setPlaying?: (arg:boolean) => void;
}

export default function PollenTimeline({ setPlaying: play }: Props) {
  const [active, setActive] = useState(10); // default to 16:00
  const [playing, setPlaying] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % hours.length);
    }, 1000);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (barRef.current) {
      const activeEl = barRef.current.children[active] as HTMLElement;
      activeEl?.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  }, [active]);

  return (
    <div className="bg-card text-white rounded-lg shadow-md p-3 w-200 backdrop-blur-sm">
      {/* Top Floating Label */}
      {/* <div className="relative mb-2 text-center">
        <div className="inline-block bg-blue-600 text-white text-sm px-3 py-1 rounded">
          Forecast: Thursday, {hours[active]}
        </div>
      </div> */}

      <div className="flex items-center gap-2">
        {/* Left Controls */}
        <button
          onClick={() => {
            play?.(true);
            setPlaying(!playing);
          }}
          className="p-2 bg-neutral-700/40 rounded hover:bg-slate-700 transition"
        >
          {playing ? <FaPause size={14} /> : <FaPlay size={14} />}
        </button>
        <button
          onClick={() => setActive((i) => (i === 0 ? hours.length - 1 : i - 1))}
          className="p-2 bg-neutral-700/40 rounded hover:bg-slate-700 transition"
        >
          <MdChevronLeft size={18} />
        </button>

        <div
          ref={barRef}
          className="relative flex overflow-x-auto gap-[2px] scrollbar-hide flex-1 border-t border-gray-700 pt-2"
        >
          {hours.map((h, i) => (
            <div
              key={h}
              className="flex flex-col items-center relative min-w-[40px]"
            >
              <div
                className={`h-2 w-full rounded-sm ${
                  i <= active ? "bg-blue-500" : "bg-slate-700"
                }`}
              />

              <span
                className={`text-[11px] mt-1 ${
                  i === active ? "text-white" : "text-gray-400"
                }`}
              >
                {h}
              </span>

              <div className="absolute top-0 left-full h-4 w-[1px] bg-gray-700"></div>
            </div>
          ))}
        </div>

        {/* Right Controls */}
        <button
          onClick={() => setActive((i) => (i + 1) % hours.length)}
          className="p-2 bg-neutral-700/40 rounded hover:bg-slate-700 transition"
        >
          <MdChevronRight size={18} />
        </button>
      </div>

      <div className="text-xs text-gray-500 mt-2 flex justify-between">
        <span>Updated on 11.09.2025, 15:14</span>
        <span>Friday, 12.09.2025</span>
      </div>
    </div>
  );
}



      {/* <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2
                    bg-white/90 shadow-lg rounded-lg p-4
                    flex flex-col items-center w-[340px] z-1000"
      >
        <div className="mb-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            disabled={loading}
            className={`px-4 py-2 rounded font-semibold text-white transition-colors duration-200
            ${
              playing
                ? "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-400"
                : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-400"
            }
            ${loading ? "opacity-50 cursor-not-allowed" : ""}
          `}
          >
            {playing ? "Stop" : "Play"}
          </button>
        </div>

        <div className="w-full">
          <label
            htmlFor="hourSlider"
            className="block mb-2 text-center bg-gray-800"
          >
            Hour selected: {selectedHour} hour(s)
          </label>
          <input
            disabled={loading}
            id="hourSlider"
            type="range"
            min="0"
            max="48"
            value={selectedHour}
            onChange={handleSliderChange}
            className="w-full"
          />
          {loading && <span>LOADING ...{loadingHour}</span>}
        </div>
      </div> */}