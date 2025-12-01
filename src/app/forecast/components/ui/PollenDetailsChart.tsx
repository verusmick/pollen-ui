'use client';

import { memo, useEffect, useRef, useState, useMemo } from 'react';
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
import dayjs from 'dayjs';
import { usePollenDetailsChartStore } from '@/app/forecast/stores';
import {
  getPollenByApiKey,
  LEVEL_COLORS,
  PollenApiKey,
} from '@/app/forecast/constants';
import { useTranslations } from 'next-intl';
import { LoadingSpinner } from '@/app/components';
import { usePartialLoadingStore } from '@/app/stores';
import { COLORS } from '@/app/styles/colors';

interface PollenData {
  timestamp: number;
  value: number | null;
  hour: number;
  dateString: string;
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
  const pointWidth = 60;

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const processChartData = (
    chartData: Record<string, string | number>,
    currentDate: string
  ) => {
    if (!chartData || !currentDate) return [];

    const startOfDay = dayjs(currentDate).startOf('day');
    const reversed = Object.values(chartData).reverse();

    return reversed.map((v: string | number, i: number) => {
      const date = startOfDay.add(i, 'hour');
      const value =
        typeof v === 'number'
          ? v
          : isNaN(parseInt(v as string))
          ? null
          : parseInt(v as string);

      return {
        timestamp: date.valueOf(),
        value,
        hour: date.hour(),
        dateString: date.format('DD MMM YYYY'),
      };
    });
  };

  const currentHourIndex = useMemo(() => {
    if (!data.length) return 0;
    const nowHour = new Date().getHours();
    const index = data.findIndex((d) => d.hour === nowHour);
    return index !== -1 ? index : 0;
  }, [data]);

  const levelCache = useMemo(() => {
    const cache: Record<number, { label: string; color: string }> = {};
    if (!pollenConfig) return cache;

    data.forEach((d) => {
      if (d.value === null || d.value === 0) {
        cache[d.value ?? 0] = { label: 'none', color: LEVEL_COLORS.none };
        return;
      }

      if (!(d.value in cache)) {
        const levels = pollenConfig.levels;
        const level =
          levels.find((l) => d.value! >= l.min && d.value! <= l.max) ||
          levels[levels.length - 1];

        const key = level.label
          .toLowerCase()
          .replace(/\s+/g, '_') as keyof typeof LEVEL_COLORS;
        cache[d.value!] = {
          ...level,
          color: LEVEL_COLORS[key] || LEVEL_COLORS.none,
        };
      }
    });

    return cache;
  }, [data, pollenConfig]);

  const scrollToCurrentHour = () => {
    if (!chartContainerRef.current || !data.length) return;
    const el = chartContainerRef.current;
    const scrollPos =
      currentHourIndex * pointWidth + pointWidth / 2 - el.clientWidth / 2;
    el.scrollTo({ left: Math.max(scrollPos, 0), behavior: 'smooth' });
    setActiveIndex(currentHourIndex);
  };

  const throttledRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateActiveIndexByScroll = () => {
    const container = chartContainerRef.current;
    if (!container || !data.length) return;
    const centerX = container.scrollLeft + container.clientWidth / 2;
    const index = Math.round((centerX - pointWidth / 2) / pointWidth);
    setActiveIndex(Math.max(0, Math.min(data.length - 1, index)));
  };

  const evaluateScroll = () => {
    const container = chartContainerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 5);
    setCanScrollRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 5
    );
  };

  const onScroll = () => {
    if (throttledRef.current) return;
    throttledRef.current = setTimeout(() => {
      updateActiveIndexByScroll();
      evaluateScroll();
      throttledRef.current = null;
    }, 50);
  };

  const scrollLeft = () =>
    chartContainerRef.current?.scrollBy({
      left: -pointWidth,
      behavior: 'smooth',
    });
  const scrollRight = () =>
    chartContainerRef.current?.scrollBy({
      left: pointWidth,
      behavior: 'smooth',
    });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.stopPropagation();
      scrollLeft();
    } else if (e.key === 'ArrowRight') {
      e.stopPropagation();
      scrollRight();
    }
  };

  const CustomDot = memo(
    ({ cx, cy, value, index }: any) => {
      if (value === null) return <g />;
      const level = levelCache[value] || { label: 'none', color: '#fff' };
      return (
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill={level.color}
          strokeWidth={1.5}
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(currentHourIndex)}
        />
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

  const CustomTick = memo(({ x, y, payload }: any) => {
    const item = data[payload.index];
    if (!item) return null;
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
          {item.hour.toString().padStart(2, '0')}:00
        </text>
        <text
          x={0}
          y={0}
          dy={22}
          textAnchor="middle"
          fill={isCurrent ? COLORS.white : COLORS.gray}
          fontSize={9}
        >
          {item.dateString}
        </text>
      </g>
    );
  });

  const getLocationName = async (
    latitude: number,
    longitude: number,
    nominatimApi: string,
    signal?: AbortSignal
  ) => {
    const res = await fetch(
      `${nominatimApi}/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      { signal }
    );
    const data = await res.json();
    const { road, suburb, city, town, village, country } = data.address;
    return [road, suburb || city || town || village, country]
      .filter(Boolean)
      .join(', ');
  };

  useEffect(() => {
    setData(processChartData(chartData || {}, currentDate));
  }, [chartData, currentDate]);

  useEffect(() => {
    if (!latitude || !longitude || !nominatimApi) return;

    const controller = new AbortController();

    getLocationName(latitude, longitude, nominatimApi, controller.signal)
      .then(setLocationName)
      .catch(() => {});

    return () => controller.abort();
  }, [latitude, longitude, nominatimApi]);

  useEffect(() => scrollToCurrentHour(), [data, currentHourIndex]);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', onScroll);
    evaluateScroll();
    return () => container.removeEventListener('scroll', onScroll);
  }, [data]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

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
                    Level range:{' '}
                    {levelCache[activePoint.value ?? 0]?.label || 'none'}
                  </span>
                )}
              </>
            )}
          </div>
          <button
            className="ml-2 mt-1 rounded-full hover:bg-gray-800 transition-colors shrink-0 cursor-pointer"
            onClick={onClose}
          >
            <BiX size={20} className="text-white" />
          </button>
        </div>

        {chartLoading || loading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner size={40} color="border-gray-200" />
          </div>
        ) : !data.length ? (
          <div className="flex justify-center items-center h-full text-gray-400 text-sm">
            {t('chart_location.msg_chart_no_data')}
          </div>
        ) : (
          <div className="relative flex h-[180px]">
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="absolute left-8 top-1/2 -translate-y-1/2 z-20 text-white bg-white/10 rounded-full p-1 cursor-pointer"
              >
                <BiChevronLeft size={20} />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white bg-white/10 rounded-full p-1 cursor-pointer"
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
                    tick={<CustomTick />}
                    interval={0}
                    tickLine={false}
                  />
                  <YAxis tick={false} tickLine={false} />
                  {data.map((d, i) => (
                    <ReferenceLine
                      key={d.timestamp}
                      x={d.timestamp}
                      stroke={i <= currentHourIndex ? COLORS.blue : COLORS.gray}
                      strokeOpacity={
                        i === currentHourIndex
                          ? 1
                          : i < currentHourIndex
                          ? 0.5
                          : 1
                      }
                      strokeWidth={i === currentHourIndex ? 2 : 1}
                      strokeDasharray={i <= currentHourIndex ? '4 2' : '5 5'}
                    />
                  ))}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#fff"
                    isAnimationActive={false}
                    dot={(props) => {
                      const { key, ...rest } = props;
                      return <CustomDot key={key} {...rest} />;
                    }}
                    activeDot={(props) => {
                      if (props.index === activeIndex) {
                        const { key, ...rest } = props;
                        return <CustomActiveDot key={key} {...rest} />;
                      }
                      return <g />;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>

              {activePoint && (
                <div
                  className="absolute transform -translate-x-1/2 bg-transparent text-white rounded-md text-[11px] whitespace-nowrap border border-white/40 px-1 py-0.5 pointer-events-none"
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
