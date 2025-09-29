"use client";
import dynamic from "next/dynamic";
import {
  getForecastByCoords,
  getLatitudes,
  getLongitudes,
} from "@/lib/api/forecast";
import { useEffect, useState } from "react";

const ForecastMap = dynamic(() => import("@/components/ForecastMap"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export const ForecastMapContainer = () => {
  const [loadingHour, setLoadingHour] = useState(0);
  const [data, setData] = useState<
    Array<{ long: number; lat: number; value: number }>
  >([]);
  const [longitudes, setLongitudes] = useState<number[]>([]);
  const [latitudes, setLatitudes] = useState<number[]>([]);
  const [selectedHour, setSelectedHour] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allData1, setAllData1] = useState<
    { long: number; lat: number; value: number }[][]
  >([]);
  const pollenType = "POLLEN_BIRCH";
  const from = 1649894400; // April 1, 2022 00:00:0ƒ0
  const to = from + 59 * 60 + 59; // April 1, 2022 00:59:59

  let allData: { long: number; lat: number; value: number }[][] = [];

  function addData(
    forecasts: number[],
    longs: number[],
    lats: number[],
    hour: number
  ) {
    let values: Array<{ long: number; lat: number; value: number }> = [];
    if (
      forecasts.length < 1 ||
      forecasts.length !== longs.length * lats.length
    ) {
      console.log(
        "Insufficient data for hour " + hour + ", adding empty array"
      );
      allData.push(values);
      return;
    }
    let i = 0;
    for (let lon of longs) {
      for (let lat of lats) {
        let value = forecasts[i];
        if (value > 0) {
          if (value >= 1 && value <= 30) {
            value = 2;
          } else if (value >= 31 && value <= 100) {
            value = 4;
          } else if (value >= 101 && value <= 200) {
            value = 6;
          } else if (value >= 201 && value <= 400) {
            value = 8;
          } else {
            value = 9;
          }
          values.push({ long: lon, lat: lat, value: value });
        }

        // let value = Math.floor(Math.random() * 10) + 1;
        // if (values.length < 50000 && value < 7) {
        //     values.push({ long: lon, lat: lat, value: value });
        // }

        i++;
      }
    }
    allData.push(values);
    setAllData1(allData);
    console.log("Added data for hour " + hour);
  }

  function loadAllData(longs, lats) {
    const hours = Array.from({ length: 48 }, (_, i) => i + 1);

    return hours
      .reduce((promiseChain, hour) => {
        return promiseChain.then(() => {
          const start = from + 60 * 60 * hour;
          const end = to + 60 * 60 * hour;
          setLoadingHour(hour);
          return getForecastByCoords({
            from: start,
            to: end,
            pollen: pollenType,
          }).then((res) => {
            addData(res, longs, lats, hour);
          });
        });
      }, Promise.resolve())
      .catch((err) => {
        console.error("Failed to load data:", err);
      });
  }

  function loadInitialData() {
    // console.log("Initial Data");
    // setLoading(true);
    let longs: number[] = [];
    let lats: number[] = [];
    getLongitudes()
      .then((res) => {
        longs = res;
        return getLatitudes();
      })
      .then((res) => {
        lats = res;
        return getForecastByCoords({ from, to, pollen: pollenType });
      })
      .then((res) => {
        // console.log("getForecastByCoords", res);
        addData(res, longs, lats, 0);
        setLongitudes(longs);
        setLatitudes(lats);
        setData(allData[0]);
        // console.log("initial data loaded", allData[0]);
        return loadAllData(longs, lats);
      })
      .then((res) => {
        setLoading(false);
        console.log("all data loaded", allData);
      })
      .catch((err) => {
        console.error("Failed to load data:", err);
        setLoading(false);
      });
  }

  const handleSliderChange = (e) => {
    const hour = parseInt(e.target.value);
    setPlaying(false); // Stop autoplay if user interacts
    setSelectedHour(hour);
    setData(allData1[hour] || []);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      setSelectedHour((prev) => {
        const nextHour = (prev + 1) % 49; // Loop from 0–48
        setData(allData1[nextHour] || []);
        return nextHour;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [playing, allData1]);
  console.log("data", data);
  return (
    <div className="relative h-screen w-screen">
      {/* Fullscreen Map */}
      <ForecastMap pollenData={data} />

      {/* Floating Control Panel */}
      <div
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
          <label htmlFor="hourSlider" className="block mb-2 text-center">
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
      </div>
    </div>
  );
};
