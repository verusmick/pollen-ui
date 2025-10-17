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
import PollenTimeline from "./ui/PollenTimeline";
import { LocationButton } from "./ui/LocationButton";
import { LocationSearch } from "./ui/LocationSearch";
import { LoadingOverlay } from "./ui/LoadingOverlay";
import { useLoadingStore } from "@/store/loadingStore";
import { useTranslations } from "next-intl";

export const ForecastMapContainer = () => {
  const t = useTranslations("forecastPage");
  const tSearch = useTranslations("forecastPage.search");
  const tLocation = useTranslations("forecastPage.show_your_location");
  const { loading, setLoading } = useLoadingStore();
  const [loadingHour, setLoadingHour] = useState(0);
  const [pollenData, setPollenData] = useState<
    Array<[long: number, lat: number, value: number]>
  >([]);
  const [longitudes, setLongitudes] = useState<number[]>([]);
  const [latitudes, setLatitudes] = useState<number[]>([]);
  const [selectedHour, setSelectedHour] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const pollenOptions = ["Birch", "Grass", "Alder"];
  const POLLEN_TYPE = "POLLEN_BIRCH";
  const from = 1649894400;
  const to = from + 59 * 60 + 59;

  const allDataRef = useRef<[long: number, lat: number, value: number][][]>([]);

  const addNewPollenData = (
    forecasts: number[],
    longs: number[],
    lats: number[],
    hour: number
  ) => {
    let values: Array<[long: number, lat: number, value: number]> = [];
    if (!forecasts.length || forecasts.length !== longs.length * lats.length) {
      allDataRef.current[hour] = values;
      return;
    }

    let i = 0;
    for (let long of longs) {
      for (let lat of lats) {
        let value = forecasts[i];
        if (value > 0) {
          if (value >= 1 && value <= 30) value = 0.2;
          else if (value <= 100) value = 0.4;
          else if (value <= 200) value = 0.6;
          else if (value <= 400) value = 0.8;
          else value = 0.9;
          // values.push({ long: lon, lat: lat, value });
          values.push([lat, long, value]);
        }
        i++;
      }
    }

    allDataRef.current[hour] = values;
    if (hour === selectedHour) setPollenData(values);
  };

  const loadHour = async (hour: number) => {
    if (!longitudes.length || !latitudes.length) return;
    if (allDataRef.current[hour]) return;

    setLoadingHour(hour);
    const start = from + 60 * 60 * hour;
    const end = to + 60 * 60 * hour;

    try {
      const res = await getForecastByCoords({
        from: start,
        to: end,
        pollen: POLLEN_TYPE,
      });
      addNewPollenData(res, longitudes, latitudes, hour);
    } catch (err) {
      console.error("Failed to load hour", hour, err);
    }
  };

  const loadInitialData = async () => {
    setLoading(true, "Loading initial pollen data...");
    try {
      const longs = await getLongitudes();
      const lats = await getLatitudes();
      setLongitudes(longs);
      setLatitudes(lats);

      const res = await getForecastByCoords({ from, to, pollen: POLLEN_TYPE });
      addNewPollenData(res, longs, lats, 0);
    } catch (err) {
      console.error("Failed to load initial data", err);
    } finally {
      setLoading(false);
    }
  };

  // Slider

  const handleSliderChange = async (hour: number) => {
    setPlaying(false);
    setSelectedHour(hour);
    await loadHour(hour);
    setPollenData(allDataRef.current[hour] || []);
  };

  // Play (Timeline)

  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(async () => {
      const nextHour = (selectedHour + 1) % 49;
      setSelectedHour(nextHour);
      await loadHour(nextHour);
      setPollenData(allDataRef.current[nextHour] || []);
    }, 1000);

    return () => clearInterval(interval);
  }, [playing, selectedHour]);

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <div className="relative h-screen w-screen">
      {loading ? (
        <>
          <LoadingOverlay message={t("message_loading")} />
        </>
      ) : (
        <>
          <ForecastMap pollenData={pollenData} />
          <span className="absolute top-6 right-6 z-50 flex flex-col items-start gap-2">
            <SearchCardToggle title={tSearch("title_tooltip_search")}>
              <LocationSearch onSelect={(pos) => setUserLocation(pos)} />
            </SearchCardToggle>
            <LocationButton tooltipText={tLocation("title_tooltip_location")} />
          </span>
          <ForecastHeader title={t("title")} iconSrc="/zaum.png" />
          <span className="absolute top-20 left-6 w-[160px] z-50">
            <PollenSelector
              options={pollenOptions}
              selected={pollenOptions[0]}
            />
          </span>
          <span className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <PollenTimeline
              setPlaying={setPlaying}
              playing={playing}
              activeHour={selectedHour}
              onHourChange={handleSliderChange}
            />
          </span>
        </>
      )}
    </div>
  );
};
