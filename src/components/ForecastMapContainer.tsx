"use client";
import {
  getForecastByCoords,
  getLatitudes,
  getLongitudes,
} from "@/lib/api/forecast";
import { useEffect, useState } from "react";
import ForecastMap from "@/components/ForecastMap";
import { ForecastHeader } from "./ui/ForecastHeader";
import { PollenSelector } from "./ui/PollenSelector";
import { SearchCardToggle } from "./ui/SearchCardToggle";
import { BiSearch } from "react-icons/bi";
import PollenTimeline from "./ui/PollenTimeline";
import { LocationButton } from "./ui/LocationButton";

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
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const pollenOptions = ["Birch", "Grass", "Abies"];
  const pollenType = "POLLEN_BIRCH";
  const from = 1649894400;
  const to = from + 59 * 60 + 59;

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
            value = 0.2;
          } else if (value >= 31 && value <= 100) {
            value = 0.4;
          } else if (value >= 101 && value <= 200) {
            value = 0.6;
          } else if (value >= 201 && value <= 400) {
            value = 0.8;
          } else {
            value = 0.9;
          }
          values.push({ long: lon, lat: lat, value: value });
        }
        i++;
      }
    }
    allData.push(values);
    setAllData1(allData);
    // console.log("Added data for hour " + hour);
  }

  function loadAllData(longs: number[], lats: number[]) {
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
        addData(res, longs, lats, 0);
        setLongitudes(longs);
        setLatitudes(lats);
        setData(allData[0]);
        // console.log("initial data loaded", allData[0]);
        // return loadAllData(longs, lats);
      })
      .then((res) => {
        setLoading(false);
        // console.log("all data loaded", allData);
      })
      .catch((err) => {
        // console.error("Failed to load data:", err);
        setLoading(false);
      });
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hour = parseInt(e.target.value);
    setPlaying(false);
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
        const nextHour = (prev + 1) % 49;
        setData(allData1[nextHour] || []);
        return nextHour;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [playing, allData1]);

  return (
    <div className="relative h-screen w-screen">
      <ForecastMap pollenData={data} userLocation={userLocation} />
      <span className="absolute top-6 right-6 z-50 flex flex-col items-start gap-2">
        <SearchCardToggle title="Search">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search Location..."
              className="w-full pr-10 px-4 py-1 rounded-2xl focus:outline-none bg-neutral-900 text-md text-white"
            />
            <BiSearch
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </SearchCardToggle>
        <LocationButton onLocationFound={(pos) => setUserLocation(pos)} />
      </span>

      {/*Card Title*/}
      <ForecastHeader title="Forecast Map" iconSrc="/zaum.png" />
      {/*pollen select*/}
      <span className="absolute top-20 left-6 w-[160px] z-50">
        <PollenSelector options={pollenOptions} selected={pollenOptions[0]} />
      </span>
      <span className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <PollenTimeline setPlaying={setPlaying} />
      </span>
    </div>
  );
};
