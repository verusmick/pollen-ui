'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { BiX, BiChevronLeft, BiChevronRight } from 'react-icons/bi';
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
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const pointWidth = 60;

  const processChartData = (
    chartData: Record<string, string | number>,
    currentDate: string
  ): PollenData[] => {
    if (!chartData || !currentDate) return [];

    const [year, month, day] = currentDate.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const hoursInterval = 1;
    const reversedChartData = Object.values(chartData).reverse();

    return reversedChartData.map((v: string | number, i: number) => ({
      timestamp: startOfDay.getTime() + i * hoursInterval * 60 * 60 * 1000,
      value:
        typeof v === 'number' ? v : isNaN(parseInt(v)) ? null : parseInt(v),
    }));
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
    ({ cx, cy }: any) => (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        stroke="#ffae42"
        strokeWidth={3}
        fill="#1E293B"
      />
    ),
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

  const scrollToCurrentHour = () => {
    if (!chartContainerRef.current || data.length === 0) return;
    const index = getCurrentHourIndex(data);
    setActiveIndex(index);

    const el = chartContainerRef.current;
    const pointPosition = index * pointWidth + pointWidth / 2;
    const scrollPosition = pointPosition - el.clientWidth / 2;

    el.scrollTo({ left: Math.max(scrollPosition, 0), behavior: 'smooth' });
  };

  const updateActiveIndexByScroll = () => {
    const el = chartContainerRef.current;
    if (!el || data.length === 0) return;

    const centerX = el.scrollLeft + el.clientWidth / 2;
    const index = Math.round((centerX - pointWidth / 2) / pointWidth);
    const clampedIndex = Math.max(0, Math.min(data.length - 1, index));

    if (clampedIndex !== activeIndex) setActiveIndex(clampedIndex);
  };

  const handleMouseMove = (state: any) => {
    if (!state.isTooltipActive) return;

    const index = Number(state.activeTooltipIndex);
    if (!isNaN(index) && index !== activeIndex) {
      setActiveIndex(index);
      const tooltipWidth = 50;
      const tooltipLeft =
        index * pointWidth + pointWidth / 2 - tooltipWidth / 2;

      const el = chartContainerRef.current;
      if (!el) return;

      if (tooltipLeft + tooltipWidth > el.scrollLeft + el.clientWidth) {
        el.scrollTo({
          left: tooltipLeft - el.clientWidth + tooltipWidth + 10,
          behavior: 'smooth',
        });
      }
      if (tooltipLeft < el.scrollLeft) {
        el.scrollTo({ left: tooltipLeft - 10, behavior: 'smooth' });
      }
    }
  };

  const scrollLeft = () => {
    const el = chartContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: -pointWidth, behavior: 'smooth' });
    setTimeout(updateActiveIndexByScroll, 200);
  };

  const scrollRight = () => {
    const el = chartContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: pointWidth, behavior: 'smooth' });
    setTimeout(updateActiveIndexByScroll, 200);
  };

  const evaluateScroll = () => {
    const el = chartContainerRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  const setupScrollListeners = (ref: React.RefObject<HTMLElement | null>) => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener('scroll', updateActiveIndexByScroll);
    el.addEventListener('scroll', evaluateScroll);
    evaluateScroll();

    return () => {
      el.removeEventListener('scroll', updateActiveIndexByScroll);
      el.removeEventListener('scroll', evaluateScroll);
    };
  };

  const handleKeyDown = (
    e: KeyboardEvent,
    chartContainerRef: React.RefObject<HTMLDivElement | null>,
    scrollLeft: () => void,
    scrollRight: () => void
  ) => {
    const el = chartContainerRef.current;
    if (!el) return;

    if (e.key === 'ArrowLeft') {
      e.stopPropagation();
      scrollLeft();
    } else if (e.key === 'ArrowRight') {
      e.stopPropagation();
      scrollRight();
    }
  };
  
  useEffect(() => {
    const listener = (e: KeyboardEvent) =>
      handleKeyDown(e, chartContainerRef, scrollLeft, scrollRight);

    window.addEventListener('keydown', listener, { capture: true });

    return () => {
      window.removeEventListener('keydown', listener, { capture: true });
    };
  }, [data, activeIndex]);

  useEffect(
    () => setData(processChartData(chartData || {}, currentDate)),
    [chartData, currentDate]
  );
  useEffect(() => scrollToCurrentHour(), [data]);

  useEffect(() => {
    const cleanup = setupScrollListeners(chartContainerRef);
    return cleanup;
  }, [data]);

  useEffect(() => {
    if (!latitude || !longitude) return;
    fetchLocationName(latitude, longitude).then(setLocationName);
  }, [latitude, longitude]);

  const currentHourIndex = getCurrentHourIndex(data);
  const activePoint = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="bg-card rounded-lg p-4 z-50 2xl:w-[25vw] w-[30vw] h-[45vh] md:h-68 flex flex-col overflow-hidden">
      <div className="relative flex-1 w-full h-full">
        {/* Header */}
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
          <div className="relative flex h-[180px]">
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="absolute left-8 top-1/2 -translate-y-1/2 z-20
                  text-white bg-white/10 rounded-full p-1"
              >
                <BiChevronLeft size={20} />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20
                  text-white bg-white/10 rounded-full p-1"
              >
                <BiChevronRight size={20} />
              </button>
            )}
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
              <ResponsiveContainer
                minWidth={data.length * pointWidth}
                height="100%"
              >
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
                      x2={data[currentHourIndex].timestamp}
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
                  {data.map((d, i) => (
                    <ReferenceLine
                      key={d.timestamp}
                      x={d.timestamp}
                      stroke={
                        i === currentHourIndex
                          ? COLORS.blue
                          : i < currentHourIndex
                          ? COLORS.blue
                          : COLORS.gray
                      }
                      strokeOpacity={
                        i === currentHourIndex
                          ? 1
                          : i < currentHourIndex
                          ? 0.5
                          : 1
                      }
                      strokeWidth={i === currentHourIndex ? 2 : 1}
                      strokeDasharray={
                        i === currentHourIndex
                          ? '4 2'
                          : i < currentHourIndex
                          ? '4 2'
                          : '5 5'
                      }
                    />
                  ))}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#fff"
                    isAnimationActive={false}
                    dot={(props) => <CustomDot {...props} />}
                    activeDot={(props) =>
                      props.index === activeIndex ? (
                        <CustomActiveDot {...props} />
                      ) : (
                        <g />
                      )
                    }
                  />
                </LineChart>
              </ResponsiveContainer>

              {activePoint && (
                <div
                  className="absolute transform -translate-x-1/2 bg-transparent text-white rounded-md 
                    text-[11px] whitespace-nowrap border border-white/40 px-1 py-0.5 pointer-events-none"
                  style={{
                    left: activeIndex * pointWidth + pointWidth / 2,
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
