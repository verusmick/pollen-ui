'use client';

import { useEffect, useState } from 'react';
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

interface PollenData {
  timestamp: number;
  value: number | null;
}

export const PollenDetailsChart = ({ onClose }: { onClose?: () => void }) => {
  const { data: chartData, latitude, longitude } = usePollenDetailsChartStore();
  const { chartLoading } = usePartialLoadingStore();
  const [data, setData] = useState<PollenData[]>([]);
  const [locationName, setLocationName] = useState();
  useEffect(() => {
    if (!chartData) return;

    const now = new Date();
    const hoursInterval = 1;

    const updatedData = chartData.map((v: string | number, i: number) => ({
      timestamp: now.getTime() + i * hoursInterval * 60 * 60 * 1000,
      value:
        typeof v === 'number' ? v : isNaN(parseInt(v)) ? null : parseInt(v),
    }));

    setData(updatedData);
  }, [chartData]);

  const getColorByValue = (value: number) => {
    if (value >= 100) return '#ff0000';
    if (value >= 70) return '#f27200';
    if (value >= 50) return '#ebbb02';
    if (value >= 25) return '#a5eb02';
    return '#00e838';
  };

  const CustomTick = ({ x, y, payload }: any) => {
    const item = data[payload.index];
    if (!item) return null;

    const date = new Date(item.timestamp);
    const hourLabel = `${date.getHours().toString().padStart(2, '0')}:00`;
    const dateLabel = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

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
  useEffect(() => {
    if (!latitude || !longitude) return;
    const fetchLocationName = async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await res.json();
      setLocationName(data.display_name);
    };
    fetchLocationName();
  }, [latitude, longitude]);
  return (
    <div
      className="absolute 2xl:top-44 md:top-40 left-4 2xl:left-10 md:left-8
              bg-card rounded-lg p-4 md:p-5 z-50 2xl:w-[25vw] w-[30vw] h-[45vh] md:h-60
              flex flex-col overflow-hidden search-scroll"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div
          className="flex items-center gap-2 text-white text-xs md:text-sm font-semibold truncate max-w-[80%]"
          title={
            locationName || `${latitude?.toFixed(3)}, ${longitude?.toFixed(3)}`
          }
        >
          <span>📍</span>
          <span className="truncate">
            {locationName ||
              `${latitude?.toFixed(3)}, ${longitude?.toFixed(3)}`}
          </span>
        </div>

        <button
          className="rounded-full hover:bg-gray-800 transition-colors p-0.5"
          onClick={onClose}
        >
          <BiX size={20} className="text-white" />
        </button>
      </div>

      {/* Chart content */}
      <div className="relative flex-1 w-full h-full overflow-x-auto">
        {chartLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner size={40} color="border-gray-200" />
          </div>
        ) : (
          <ResponsiveContainer width={data.length * 60} height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 20, bottom: 10, left: -25 }}
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
              <YAxis style={{ fontSize: 10, fill: '#fff' }} tickLine={false} />
              <Tooltip
                content={({ active, payload, coordinate }) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value;
                    const x = coordinate?.x ?? 0;
                    return (
                      <div
                        className="absolute transform -translate-x-1/2 bg-transparent text-white rounded-md 
                               text-[11px] whitespace-nowrap border border-white/40 px-1 py-0.5 pointer-events-none"
                        style={{ left: x, top: 0 }}
                      >
                        <div className="font-bold text-center">
                          {value ?? 'NA'}
                        </div>
                        <div className="text-[9px] text-gray-300">
                          Pollen/m³
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#fff"
                dot={({ cx, cy, value, index }) => {
                  if (value === null) return null;
                  return (
                    <circle
                      key={index}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={getColorByValue(value)}
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
        )}
      </div>
    </div>
  );
};
