'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BiX } from 'react-icons/bi';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LoadingSpinner } from '@/app/forecast/components';
import {
  usePartialLoadingStore,
  usePollenDetailsChartStore,
} from '@/app/forecast/stores';
import { getPollenByApiKey } from '../../constants';

interface PollenData {
  timestamp: number;
  value: number | null;
}

export const PollenDetailsChart = React.memo(
  ({
    onClose,
    currentDate,
    pollenSelected,
  }: {
    onClose?: () => void;
    currentDate: string;
    pollenSelected: string;
  }) => {
    const pollenConfig = getPollenByApiKey(pollenSelected as PollenApiKey);
    const {
      data: chartData,
      latitude,
      longitude,
    } = usePollenDetailsChartStore();
    const { chartLoading } = usePartialLoadingStore();

    const [locationName, setLocationName] = useState<string>();
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const tooltipValueRef = useRef<number | null>(null);
    const tooltipActiveRef = useRef(false);
    const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);
    const displayLevelRef = useRef<string | null>(null); // <-- ref para nivel

    // ✅ Memoizar datos para evitar recalcularlos
    const data = useMemo(() => {
      if (!chartData || !currentDate) return [];

      const [year, month, day] = currentDate.split('-').map(Number);
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      const hoursInterval = 1;
      const reversedChartData = [...chartData].reverse();

      return reversedChartData.map((v: string | number, i: number) => ({
        timestamp: startOfDay.getTime() + i * hoursInterval * 60 * 60 * 1000,
        value:
          typeof v === 'number' ? v : isNaN(parseInt(v)) ? null : parseInt(v),
      }));
    }, [chartData, currentDate]);

    // ✅ Calcular niveles sin re-render
    const getLevelByValue = useCallback(
      (value: number | null) => {
        if (!pollenConfig || value === null || value < 1)
          return { label: 'none', color: '#fff' };

        const colors = ['#00e838', '#a5eb02', '#ebbb02', '#f27200', '#ff0000'];
        const levels = pollenConfig.levels;

        const level =
          levels.find((l) => value >= l.min && value <= l.max) ||
          levels[levels.length - 1];

        return {
          ...level,
          color: colors[levels.indexOf(level)] || '#fff',
        };
      },
      [pollenConfig]
    );

    // ✅ Eje X personalizado
    const CustomTick = ({ x, y, payload }: any) => {
      const item = data[payload.index];
      if (!item) return null;

      const date = new Date(item.timestamp);
      const hourLabel = `${date.getHours().toString().padStart(2, '0')}:00`;
      const day = date.getDate().toString().padStart(2, '0');
      const monthShort = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const dateLabel = `${day} ${monthShort} ${year}`;

      return (
        <g transform={`translate(${x},${y})`}>
          <text
            x={0}
            y={0}
            dy={10}
            textAnchor="middle"
            fill="#fff"
            fontSize={10}
          >
            {hourLabel}
          </text>
          <text
            x={0}
            y={0}
            dy={22}
            textAnchor="middle"
            fill="#9CA3AF"
            fontSize={9}
          >
            {dateLabel}
          </text>
        </g>
      );
    };

    // ✅ Tooltip optimizado (no causa re-render)
    const renderTooltip = useCallback(
      ({ active, payload, coordinate }: any) => {
        if (active && payload && payload.length) {
          const value = payload[0].value;
          const x = coordinate?.x ?? 0;

          if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);

          tooltipActiveRef.current = true;
          tooltipValueRef.current = value;

          // ✅ Solo actualizamos la ref, no el estado
          displayLevelRef.current = getLevelByValue(value).label;

          return (
            <div
              ref={tooltipRef}
              className="absolute transform -translate-x-1/2 bg-transparent text-white rounded-md 
                   text-[11px] whitespace-nowrap border border-white/40 px-1 py-0.5 pointer-events-none"
              style={{ left: x, top: 0 }}
            >
              <div className="font-bold text-center text-sx">
                {value ?? 'NA'}
              </div>
              <div className="text-[9px] text-gray-300">Pollen/m³</div>
            </div>
          );
        } else {
          tooltipTimeout.current = setTimeout(() => {
            tooltipActiveRef.current = false;
            tooltipValueRef.current = null;
            displayLevelRef.current = null; // 🔹 limpiar ref
          }, 150);
        }
        return null;
      },
      [getLevelByValue]
    );

    // ✅ Fetch ubicación
    useEffect(() => {
      if (!latitude || !longitude) return;
      const fetchLocationName = async () => {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        const { road, suburb, city, town, village, country } = data.address;
        const shortName = [road, suburb || city || town || village, country]
          .filter(Boolean)
          .join(', ');
        setLocationName(shortName);
      };
      fetchLocationName();
    }, [latitude, longitude]);

    return (
      <div
        className="absolute 2xl:top-44 md:top-40 left-4 2xl:left-10 md:left-8
                      bg-card rounded-lg p-4 md:p-5 z-50 2xl:w-[25vw] w-[30vw] h-[45vh] md:h-68
                      flex flex-col overflow-hidden"
      >
        <div className="relative flex-1 w-full h-full">
          <div className="flex flex-col gap-1 text-white">
            {locationName && (
              <span
                className="text-xs font-semibold text-white block truncate"
                title={locationName}
              >
                📍 {locationName}
              </span>
            )}
            <span className="text-xs text-gray-400">
              Lat: {latitude?.toFixed(3)} | Lon: {longitude?.toFixed(3)}
            </span>

            {tooltipActiveRef.current && displayLevelRef.current && (
              <span className="text-xs text-gray-400 transition-opacity duration-150">
                Level range: {displayLevelRef.current}
              </span>
            )}
          </div>

          <button
            className="absolute top-0 right-0 rounded-full hover:bg-gray-800 transition-colors"
            onClick={onClose}
          >
            <BiX size={20} className="text-white" />
          </button>

          {chartLoading ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner size={40} color="border-gray-200" />
            </div>
          ) : (
            <div className="overflow-x-auto w-full h-[20vh] search-scroll">
              <ResponsiveContainer minWidth={data.length * 60} height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 35, right: 20, bottom: 5, left: -25 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#fff"
                    vertical
                    horizontal
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="timestamp"
                    tick={<CustomTick />}
                    interval={0}
                    tickLine={false}
                  />
                  <YAxis
                    style={{ fontSize: 10, fill: '#fff' }}
                    tickLine={false}
                  />
                  <Tooltip content={renderTooltip} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    connectNulls={false}
                    stroke="#fff"
                    dot={({ cx, cy, value, index }) => {
                      if (value === null) return null;
                      const level = getLevelByValue(value);
                      return (
                        <circle
                          key={index}
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill={level.color}
                          strokeWidth={1.5}
                        />
                      );
                    }}
                    activeDot={{
                      r: 6,
                      stroke: '#ffae42',
                      strokeWidth: 3,
                      fill: '#1E293B',
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    );
  }
);
