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

interface PollenChartProps {}

export const PollenChart = ({}: PollenChartProps) => {
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
    <div className="w-[35vw] h-60 absolute top-40 z-50 left-8 bg-card rounded-lg p-2 py-5">
     
      <div className="absolute top-2 left-2 right-2 flex justify-between items-center font-bold ">
        <span className="text-white text-md">{`${latitude} ${longitude}`}</span>
        <button className="p-1 rounded-full  bg-opacity-50 hover:bg-gray-800 transition-colors">
          <BiX size={20} className="text-white" />
        </button>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 30, right: 20, bottom: 0, left: -25 }}
        >
          <XAxis dataKey="hour" style={{ fontSize: 10, fill: "#fff" }} />
          <YAxis style={{ fontSize: 10, fill: "#fff" }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#A0BCE8"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 15"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
