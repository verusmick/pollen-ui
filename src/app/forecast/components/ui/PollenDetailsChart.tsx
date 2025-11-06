'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { useTranslations } from 'next-intl';

interface PollenData {
  timestamp: number;
  value: number | null;
}

export const PollenDetailsChart = ({
  onClose,
  currentDate,
}: {
  onClose?: () => void;
  currentDate: string;
}) => {
  const t = useTranslations('forecastPage.legend');
  const { data: chartData, latitude, longitude } = usePollenDetailsChartStore();
  const { chartLoading } = usePartialLoadingStore();
  const [data, setData] = useState<PollenData[]>([]);
  const [locationName, setLocationName] = useState<string>();
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [tooltipActive, setTooltipActive] = useState(false);
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!chartData || !currentDate) return;

    const [year, month, day] = currentDate.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const hoursInterval = 1;

    const updatedData = chartData.map((v: string | number, i: number) => ({
      timestamp: startOfDay.getTime() + i * hoursInterval * 60 * 60 * 1000,
      value:
        typeof v === 'number' ? v : isNaN(parseInt(v)) ? null : parseInt(v),
    }));

    setData(updatedData);
  }, [chartData, currentDate]);

  const levels = [
    { key: 'none', color: '#ffffff', max: 0 },
    { key: 'very_low', color: '#00e838', max: 24 },
    { key: 'low', color: '#a5eb02', max: 49 },
    { key: 'moderate', color: '#ebbb02', max: 69 },
    { key: 'high', color: '#f27200', max: 99 },
    { key: 'very_high', color: '#ff0000', max: Infinity },
  ];

  const getLevelByValue = (value: number | null) => {
    if (value === null) return levels[0];
    return levels.find((l) => value <= l.max) || levels[levels.length - 1];
  };

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
        <text x={0} y={0} dy={10} textAnchor="middle" fill="#fff" fontSize={10}>
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

  const renderTooltip = useCallback(
    ({ active, payload, coordinate }: any) => {
      if (active && payload && payload.length) {
        const value = payload[0].value;
        const x = coordinate?.x ?? 0;

        // 🔹 Cancelar cualquier timeout previo
        if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);

        // Activar inmediatamente
        if (activePoint !== value) setActivePoint(value);
        if (!tooltipActive) setTooltipActive(true);

        return (
          <div
            className="absolute transform -translate-x-1/2 bg-transparent text-white rounded-md 
                     text-[11px] whitespace-nowrap border border-white/40 px-1 py-0.5 pointer-events-none"
            style={{ left: x, top: 0 }}
          >
            <div className="font-bold text-center text-[9px]">
              {value ?? 'NA'}
            </div>
            <div className="text-[8px] text-gray-300">Pollen/m³</div>
          </div>
        );
      } else {
        // 🔹 Esperar 150 ms antes de ocultar
        tooltipTimeout.current = setTimeout(() => {
          setTooltipActive(false);
          setActivePoint(null);
        }, 150);
      }
      return null;
    },
    [activePoint, tooltipActive]
  );

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

          {tooltipActive && activePoint !== null && (
            <span className="text-xs text-gray-400 transition-opacity duration-150">
              Level range: {t(getLevelByValue(activePoint).key)}
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
};
