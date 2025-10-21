"use client";

import { useEffect, useState } from "react";
import { BiX } from "react-icons/bi";
import {
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

export const PollenChart = ({ onClose }: PollenChartProps) => {
  const [data, setData] = useState<Array<{ hour: number; value: number }>>([]);

  useEffect(() => {
    const fakeData = Array.from({ length: 13 }, (_, i) => ({
      hour: i,
      value: Math.floor(Math.random() * 100),
    }));
    setData(fakeData);
  }, []);

  const latitude = "-16.5";
  const longitude = "-68.1";

  return (
    <div
      className="absolute 2xl:top-44 md:top-40 left-4 2xl:left-10 md:left-8 bg-card rounded-lg p-4 md:p-5 z-50
      w-[90vw] md:w-[35vw] h-[45vh] md:h-60 flex flex-col"
    >
      <div className="flex justify-between items-center font-bold mb-2">
        <span className="text-white text-sm md:text-md">{`${latitude} ${longitude}`}</span>
        <button
          className="p-1 rounded-full hover:bg-gray-800 transition-colors"
          onClick={onClose}
        >
          <BiX size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, bottom: 0, left: -25 }}
          >
            <XAxis
              dataKey="hour"
              style={{ fontSize: 10, fill: "#fff" }}
              tickLine={false}
            />
            <YAxis style={{ fontSize: 10, fill: "#fff" }} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1E293B",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#A0BCE8"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 15"
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
  );
};
