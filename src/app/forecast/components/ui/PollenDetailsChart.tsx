'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { BiX } from 'react-icons/bi';
import {
  CartesianGrid,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Line,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';

import { usePollenDetailsChartStore } from '@/app/forecast/stores';
import { getPollenByApiKey, PollenApiKey } from '@/app/forecast/constants';
import { useTranslations } from 'next-intl';
import { LoadingSpinner } from '@/app/components';
import { usePartialLoadingStore } from '@/app/stores';
import { COLORS } from '@/app/styles/colors';

interface PollenData {
  timestamp: number;
  value: number | null;
}

export const PollenDetailsChart = ({
  onClose,
  currentDate,
  pollenSelected,
  loading,
}: {
  onClose?: () => void;
  currentDate: string;
  pollenSelected: string;
  loading: boolean;
}) => {
  const nominatimApi = process.env.NEXT_PUBLIC_NOMINATIM_API;
  const t = useTranslations('forecastPage');
  const pollenConfig = getPollenByApiKey(pollenSelected as PollenApiKey);
  const { data: chartData, latitude, longitude } = usePollenDetailsChartStore();
  const { chartLoading } = usePartialLoadingStore();
  const [data, setData] = useState<PollenData[]>([]);
  const [locationName, setLocationName] = useState<string>();
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const processChartData = (
    chartData: Record<string, string | number>,
    currentDate: string
  ): PollenData[] => {
    if (!chartData || !currentDate) return [];

    const [year, month, day] = currentDate.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const hoursInterval = 1;

    const reversedChartData = Object.values(chartData).reverse();

    const data = reversedChartData.map((v: string | number, i: number) => ({
      timestamp: startOfDay.getTime() + i * hoursInterval * 60 * 60 * 1000,
      value:
        typeof v === 'number' ? v : isNaN(parseInt(v)) ? null : parseInt(v),
    }));

    const thirdMidnight = new Date(
      year,
      month - 1,
      day + 2, 
      0,
      0,
      0,
      0
    ).getTime();

    const alreadyHasThirdMidnight = data.some(
      (d) => d.timestamp === thirdMidnight
    );

    if (!alreadyHasThirdMidnight) {
      data.push({
        timestamp: thirdMidnight,
        value: null,
      });
    }

    return data;
  };

  const getCurrentHourIndex = (data: PollenData[]): number => {
    if (!data.length) return 0;

    const now = new Date();
    const currentHour = now.getHours();
    const index = data.findIndex(
      (item) => new Date(item.timestamp).getHours() === currentHour
    );
    return index !== -1 ? index : 0;
  };

  const currentHourIndex = getCurrentHourIndex(data);

  const getLevelByValue = (value: number | null) => {
    if (!pollenConfig || value === null || value < 1)
      return { label: 'none', color: '#fff' };
    const colors = ['#00e838', '#a5eb02', '#ebbb02', '#f27200', '#ff0000'];
    const levels = pollenConfig.levels;
    const level =
      levels.find((l) => value >= l.min && value <= l.max) ||
      levels[levels.length - 1];
    return { ...level, color: colors[levels.indexOf(level)] || '#fff' };
  };

  const CustomTick = ({ x, y, payload, currentHourIndex }: any) => {
    const item = data[payload.index];
    if (!item) return null;

    const date = new Date(item.timestamp);
    const hour = date.getHours();
    const hourLabel = `${hour.toString().padStart(2, '0')}:00`;

    const isCurrent = payload.index === currentHourIndex;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={10}
          textAnchor="middle"
          fill={isCurrent ? COLORS.white : COLORS.gray}
          fontSize={isCurrent ? 12 : 10}
          fontWeight={isCurrent ? 'bold' : 'normal'}
        >
          {hourLabel}
        </text>
        <text
          x={0}
          y={0}
          dy={22}
          textAnchor="middle"
          fill={isCurrent ? COLORS.white : COLORS.gray}
          fontSize={9}
        >
          {date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </text>
      </g>
    );
  };
  const CustomDot = memo(
    ({ cx, cy, value }: any) => {
      if (value === null) return <g />;
      const level = getLevelByValue(value);
      return (
        <circle cx={cx} cy={cy} r={4} fill={level.color} strokeWidth={1.5} />
      );
    },
    (prev, next) => prev.value === next.value
  );
  const CustomActiveDot = memo(
    ({ cx, cy }: any) => {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          stroke="#ffae42"
          strokeWidth={3}
          fill="#1E293B"
        />
      );
    },
    () => true
  );
  const fetchLocationName = async (latitude: number, longitude: number) => {
    if (!latitude || !longitude) return '';
    const res = await fetch(
      `${nominatimApi}/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await res.json();
    const { road, suburb, city, town, village, country } = data.address;
    const shortName = [road, suburb || city || town || village, country]
      .filter(Boolean)
      .join(', ');
    return shortName;
  };

  const scrollToCurrentHour = (
    data: PollenData[],
    chartContainer: HTMLDivElement | null,
    setActiveIndex: (index: number) => void
  ) => {
    if (!data.length || !chartContainer) return;

    const now = new Date();
    const currentHour = now.getHours();

    const index = data.findIndex(
      (item) => new Date(item.timestamp).getHours() === currentHour
    );

    if (index !== -1) {
      setActiveIndex(index);
      const pointPosition = index * 60 + 30;
      const scrollPosition = pointPosition - chartContainer.clientWidth / 2;

      chartContainer.scrollTo({
        left: Math.max(scrollPosition, 0),
        behavior: 'smooth',
      });
    }
  };

  const ensureTooltipVisible = (
    chartContainer: HTMLDivElement | null,
    tooltipLeft: number,
    tooltipWidth: number
  ) => {
    if (!chartContainer) return;

    const containerLeft = chartContainer.scrollLeft;
    const containerRight = containerLeft + chartContainer.clientWidth;

    const tooltipRight = tooltipLeft + tooltipWidth;

    if (tooltipRight > containerRight) {
      chartContainer.scrollTo({
        left: tooltipRight - chartContainer.clientWidth + 10,
        behavior: 'smooth',
      });
    }

    if (tooltipLeft < containerLeft) {
      chartContainer.scrollTo({
        left: tooltipLeft - 10,
        behavior: 'smooth',
      });
    }
  };

  const handleMouseMove = (state: any) => {
    if (!state.isTooltipActive) return;

    const index = Number(state.activeTooltipIndex);
    if (!isNaN(index) && index !== activeIndex) {
      setActiveIndex(index);

      const tooltipWidth = 50;
      const tooltipLeft = index * 60 + 35 - tooltipWidth / 2;

      ensureTooltipVisible(
        chartContainerRef.current,
        tooltipLeft,
        tooltipWidth
      );
    }
  };
  const getLocation = async (
    latitude: number,
    longitude: number,
    setLocationName: (name: string) => void,
    fetchLocationName: (lat: number, lon: number) => Promise<string>
  ) => {
    const name = await fetchLocationName(latitude, longitude);
    if (name) setLocationName(name);
  };
  useEffect(() => {
    const updatedData = processChartData(chartData || {}, currentDate);
    setData(updatedData);
  }, [chartData, currentDate]);

  useEffect(() => {
    const index = getCurrentHourIndex(data);
    setActiveIndex(index);
  }, [data]);

  useEffect(() => {
    if (!latitude || !longitude) return;
    getLocation(latitude, longitude, setLocationName, fetchLocationName);
  }, [latitude, longitude]);

  useEffect(() => {
    if (data.length > 0 && chartContainerRef.current) {
      scrollToCurrentHour(data, chartContainerRef.current, setActiveIndex);
    }
  }, [data]);

  const activePoint = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="bg-card rounded-lg p-4 md:p-5 z-50 2xl:w-[25vw] w-[30vw] h-[45vh] md:h-68 flex flex-col overflow-hidden">
      <div className="relative flex-1 w-full h-full">
        <div className="flex justify-between items-start w-full mb-2">
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            {!latitude || !longitude ? (
              <span className="text-xs text-gray-400 animate-pulse">
                📍 {t('chart_location.getting_location')}
              </span>
            ) : (
              <>
                <span
                  className="text-xs font-semibold text-white block truncate max-w-full"
                  title={locationName}
                >
                  📍 {locationName || t('chart_location.loading_name')}
                </span>
                <span className="text-xs text-gray-400">
                  Lat: {latitude.toFixed(3)} | Lon: {longitude.toFixed(3)}
                </span>
                {activePoint && (
                  <span className="text-xs text-gray-400 transition-opacity duration-150">
                    Level range: {getLevelByValue(activePoint.value).label}
                  </span>
                )}
              </>
            )}
          </div>

          <button
            className="ml-2 mt-1 rounded-full hover:bg-gray-800 transition-colors shrink-0"
            onClick={onClose}
          >
            <BiX size={20} className="text-white" />
          </button>
        </div>

        {chartLoading || loading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner size={40} color="border-gray-200" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400 text-sm">
            {t('chart_location.msg_chart_no_data')}
          </div>
        ) : (
          <div className="flex h-[180px]">
            <div className="w-8">
              <ResponsiveContainer minWidth={data.length * 60} height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 35, right: 0, bottom: 45, left: -30 }}
                >
                  <YAxis
                    dataKey="value"
                    style={{ fontSize: 10, fill: '#fff' }}
                    tickLine={false}
                    axisLine={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div
              ref={chartContainerRef}
              className="flex-1 overflow-x-auto relative search-scroll"
            >
              <ResponsiveContainer minWidth={data.length * 60} height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 35, right: 20, bottom: 10, left: -35 }}
                  onMouseMove={handleMouseMove}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#fff"
                    opacity={0.3}
                  />
                  {currentHourIndex > 0 && (
                    <ReferenceArea
                      x1={data[0].timestamp}
                      x2={data[currentHourIndex - 0].timestamp}
                      fill="rgba(255,255,255,0.4)"
                    />
                  )}
                  <XAxis
                    dataKey="timestamp"
                    tick={<CustomTick currentHourIndex={currentHourIndex} />}
                    interval={0}
                    tickLine={false}
                  />
                  <YAxis tick={false} tickLine={false} />
                  {data.map((d, i) => {
                    const isPast = i < currentHourIndex;
                    const isCurrent = i === currentHourIndex;

                    return (
                      <ReferenceLine
                        key={d.timestamp}
                        x={d.timestamp}
                        stroke={
                          isCurrent
                            ? COLORS.blue
                            : isPast
                            ? COLORS.blue
                            : COLORS.gray
                        }
                        strokeOpacity={isCurrent ? 1 : isPast ? 0.5 : 1}
                        strokeWidth={isCurrent ? 2 : 1}
                        strokeDasharray={
                          isCurrent ? '4 2' : isPast ? '4 2' : '5 5'
                        }
                      />
                    );
                  })}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#fff"
                    isAnimationActive={false}
                    dot={(props) => {
                      const { key, ...rest } = props;
                      return <CustomDot {...rest} key={key} />;
                    }}
                    activeDot={(props) => {
                      const { key, index, ...rest } = props;
                      if (index === activeIndex) {
                        return <CustomActiveDot {...rest} key={key} />;
                      }
                      return <g />;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>

              {activePoint && (
                <div
                  className="absolute transform -translate-x-1/2 bg-transparent text-white rounded-md 
                  text-[11px] whitespace-nowrap border border-white/40 px-1 py-0.5 pointer-events-none"
                  style={{
                    left: (activeIndex ?? 0) * 60 + 30,
                    top: 0,
                  }}
                >
                  <div className="font-bold text-center text-[10px]">
                    {activePoint.value ?? 'NA'}
                  </div>
                  <div className="text-[9px] text-gray-300">{t('pollen')}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
