"use client";
import {
  getForecastByCoords,
  getLatitudes,
  getLongitudes,
} from "@/lib/api/forecast";
import { useEffect, useState, useRef } from "react";
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
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const pollenOptions = ["Birch", "Grass", "Abies"];
  const pollenType = "POLLEN_BIRCH";
  const from = 1649894400;
  const to = from + 59 * 60 + 59;

  const allDataRef = useRef<{ long: number; lat: number; value: number }[][]>(
    []
  );

  function addData(
    forecasts: number[],
    longs: number[],
    lats: number[],
    hour: number
  ) {
    let values: Array<{ long: number; lat: number; value: number }> = [];
    if (!forecasts.length || forecasts.length !== longs.length * lats.length) {
      allDataRef.current[hour] = values;
      return;
    }

    let i = 0;
    for (let lon of longs) {
      for (let lat of lats) {
        let value = forecasts[i];
        if (value > 0) {
          if (value >= 1 && value <= 30) value = 0.2;
          else if (value <= 100) value = 0.4;
          else if (value <= 200) value = 0.6;
          else if (value <= 400) value = 0.8;
          else value = 0.9;
          values.push({ long: lon, lat: lat, value });
        }
        i++;
      }
    }

    allDataRef.current[hour] = values;
    if (hour === selectedHour) setData(values);
  }

  async function loadHour(hour: number) {
    if (!longitudes.length || !latitudes.length) return;
    if (allDataRef.current[hour]) return;

    setLoadingHour(hour);
    const start = from + 60 * 60 * hour;
    const end = to + 60 * 60 * hour;

    try {
      const res = await getForecastByCoords({
        from: start,
        to: end,
        pollen: pollenType,
      });
      addData(res, longitudes, latitudes, hour);
    } catch (err) {
      console.error("Failed to load hour", hour, err);
    }
  }

  async function loadInitialData() {
    try {
      const longs = await getLongitudes();
      const lats = await getLatitudes();
      setLongitudes(longs);
      setLatitudes(lats);

      const res = await getForecastByCoords({ from, to, pollen: pollenType });
      addData(res, longs, lats, 0);
    } catch (err) {
      console.error("Failed to load initial data", err);
    } finally {
      setLoading(false);
    }
  }

  // Slider

  const handleSliderChange = async (hour: number) => {
    setPlaying(false);
    setSelectedHour(hour);
    await loadHour(hour);
    setData(allDataRef.current[hour] || []);
  };

  // Play (Timeline)

  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(async () => {
      const nextHour = (selectedHour + 1) % 49;
      setSelectedHour(nextHour);
      await loadHour(nextHour);
      setData(allDataRef.current[nextHour] || []);
    }, 500);

    return () => clearInterval(interval);
  }, [playing, selectedHour]);

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <div className="relative h-screen w-screen">
      <ForecastMap pollenData={data} />

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

      <ForecastHeader title="Forecast Map" iconSrc="/zaum.png" />

      <span className="absolute top-20 left-6 w-[160px] z-50">
        <PollenSelector options={pollenOptions} selected={pollenOptions[0]} />
      </span>

      <span className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <PollenTimeline
          setPlaying={setPlaying}
          playing={playing}
          activeHour={selectedHour}
          onHourChange={handleSliderChange}
        />
      </span>
    </div>
  );
};
