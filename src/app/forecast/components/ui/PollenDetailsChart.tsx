"use client";

import { useEffect, useState } from "react";
import { BiX } from "react-icons/bi";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface PollenChartProps {
  onClose?: () => void;
}

interface PollenData {
  timestamp: number;
  value: number;
}

export const PollenDetailsChart = ({ onClose }: PollenChartProps) => {
  const [data, setData] = useState<PollenData[]>([]);

  useEffect(() => {
    const now = new Date();
    const hoursInterval = 3;
    const totalPoints = (24 / hoursInterval) * 2;

    const fakeData: PollenData[] = Array.from(
      { length: totalPoints },
      (_, i) => ({
        timestamp: now.getTime() + i * hoursInterval * 60 * 60 * 1000,
        value: Math.floor(Math.random() * 120),
      })
    );

    setData(fakeData);
  }, []);

  const latitude = "-16.5";
  const longitude = "-68.1";

  const getColorByValue = (value: number) => {
    if (value >= 100) return "#ff0000";
    if (value >= 70) return "#f27200";
    if (value >= 50) return "#ebbb02";
    if (value >= 25) return "#a5eb02";
    return "#00e838";
  };

  const CustomTick = (props: any) => {
    const { x, y, payload } = props;
    const item = data[payload.index];
    if (!item) return null;
    const date = new Date(item.timestamp);
    const hourLabel = `${date.getHours().toString().padStart(2, "0")}:00`;
    const dateLabel = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
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

  return (
    <div
      className="absolute 2xl:top-44 md:top-40 left-4 2xl:left-10 md:left-8 
                 bg-card rounded-lg p-4 md:p-5 z-50 w-[25vw] h-[45vh] md:h-60 
                 flex flex-col overflow-hidden"
    >
      <div className="relative flex-1 w-full h-full">
        <div className="text-white text-sm font-bold">
          {latitude} {longitude}
        </div>

        <button
          className="absolute top-0 right-0 rounded-full hover:bg-gray-800 transition-colors"
          onClick={onClose}
        >
          <BiX size={20} className="text-white" />
        </button>

        <div className="overflow-x-auto w-full h-full search-scroll">
          <ResponsiveContainer width={data.length * 60} height="100%">
            <LineChart
              data={data}
              margin={{ top: 42, right: 20, bottom: 10, left: -25 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#fff"
                vertical={true}
                horizontal={true}
                opacity={0.3}
              />

              <XAxis
                dataKey="timestamp"
                tick={<CustomTick />}
                interval={0}
                tickLine={false}
              />
              <YAxis style={{ fontSize: 10, fill: "#fff" }} tickLine={false} />

              <Tooltip
                content={({ active, payload, coordinate }) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value;
                    const offsetTop = 10;
                    const tooltipMargin = 10;
                    const x = coordinate?.x ?? 0;

                    return (
                      <div
                        className="absolute transform -translate-x-1/2 bg-transparent text-white rounded-md 
                     text-[11px] whitespace-nowrap border border-white/40 
                     px-1 py-0.5 pointer-events-none"
                        style={{
                          left: x,
                          top: offsetTop - tooltipMargin,
                        }}
                      >
                        <div className="font-bold text-center">{value}</div>
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
                dot={(props) => {
                  const { cx, cy, value } = props;
                  return (
                    <circle
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
                  stroke: "#ffae42",
                  strokeWidth: 3,
                  fill: "#1E293B",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
