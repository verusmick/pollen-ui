"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

import { useEffect, useRef, useState } from "react";

import {
  getForecastByCoords,
  getHourlyForecast,
  getLatitudes,
  getLongitudes,
} from "@/lib/api/forecast";

import {
  useLoadingStore,
  usePollenDetailsChartStore,
} from "@/app/forecast/stores";

import {
  LoadingOverlay,
  ForecastMap,
  SearchCardToggle,
  LocationSearch,
  LocationButton,
  ForecastHeader,
  PollenSelector,
  PollenLegend,
  PollenLegendCard,
} from "@/app/forecast/components";

import PollenTimeline from "./ui/PollenTimeline";
import {
  DEFAULT_POLLEN_API_KEY,
  type PollenApiKey,
} from "@/app/forecast/constants";

const PollenDetailsChart = dynamic(
  () => import("./ui/PollenDetailsChart").then((mod) => mod.PollenDetailsChart),
  {
    ssr: false,
  }
);
export const ForecastMapContainer = () => {
  const t = useTranslations("forecastPage");
  const tSearch = useTranslations("forecastPage.search");
  const tLocation = useTranslations("forecastPage.show_your_location");
  const { loading, setLoading } = useLoadingStore();
  const [loadingHour, setLoadingHour] = useState(0);
  const [legendOpen, setLegendOpen] = useState(false);
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
  const [selectorOpen, setSelectorOpen] = useState(false);
  const legendCardRef = useRef<HTMLDivElement>(null);
  const { show: showPollenDetailsChart, setShow: setShowPollenDetailsChart } =
    usePollenDetailsChartStore();
  const pollenOptions = ["Birch", "Grass", "Alder"];
  const POLLEN_TYPE = "POLLEN_BIRCH";
  const from = 1649894400;
  const to = from + 59 * 60 + 59;

  const [pollenSelected, setPollenSelected] = useState<PollenApiKey>(
    DEFAULT_POLLEN_API_KEY
  );

  // const currentDate = new Date().toISOString().split('T')[0];
  // todo: remove this hardcoded date when the API will be able
  const currentDate: string = "2022-04-14";

  const allDataRef = useRef<[long: number, lat: number, value: number][][]>([]);

  const handlePollenChange = (apiKey: PollenApiKey) => {
    setPollenSelected(apiKey);
  };

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
      // const { data: res } = await getHourlyForecast({
      //   date: currentDate,
      //   // to: end,
      //   pollen: POLLEN_TYPE,
      // });
      // addNewPollenData(res, longitudes, latitudes, hour);
    } catch (err) {
      console.error("Failed to load hour", hour, err);
    }
  };

  const loadInitialData = async () => {
    setLoading(true, "Loading initial pollen data...");
    try {
      const {
        data: res,
        latitudes,
        longitudes,
      } = await getHourlyForecast({
        date: currentDate,
        hour: 1,
        pollen: pollenSelected,
        box: "8.5,47.0,13.5,50.0",
        // box: "13.22,52,13.70,53",
        // intervals: "1,30,2,31,100,4,101,200,6,201,400,8,401,1000,9",
        includeCoords: true,
      });

      const longs = longitudes;
      const lats = latitudes;
      setLongitudes(longs);
      setLatitudes(lats);
      // const res = await getForecastByCoords({ from, to, pollen: POLLEN_TYPE });
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
      {/* Main content */}
      <ForecastMap pollenData={pollenData} />
      <span className="absolute top-8 right-6 z-50 flex flex-col items-start gap-2">
        <SearchCardToggle title={tSearch("title_tooltip_search")}>
          {(open, setOpen) => (
            <LocationSearch
              open={open}
              onSelect={(pos) => {
                setUserLocation(pos);
                setOpen(false);
              }}
            />
          )}
        </SearchCardToggle>
        <LocationButton tooltipText={tLocation("title_tooltip_location")} />
      </span>
      <ForecastHeader title={t("title")} iconSrc="/zaum.png" />
      <span className="absolute top-18 z-50">
        <PollenSelector onChange={handlePollenChange} />
      </span>
      {!selectorOpen && showPollenDetailsChart && (
        <PollenDetailsChart onClose={() => setShowPollenDetailsChart(false)} />
      )}
      <div className="absolute bottom-13 sm:bottom-13 md:bottom-13 left-1/2 -translate-x-1/2 z-50">
        <PollenTimeline
          setPlaying={setPlaying}
          playing={playing}
          activeHour={selectedHour}
          onHourChange={handleSliderChange}
        />
      </div>
      <div
        className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 2xl:left-10 2xl:translate-x-0 2xl:bottom-14"
        onMouseEnter={() => setLegendOpen(true)}
        onMouseLeave={() => setLegendOpen(false)}
      >
        <PollenLegend width={350} height={25} />
      </div>
      {/* Separate container for the card */}ˇ
      <div className="fixed left-10 bottom-40 2xl:bottom-24">
        <PollenLegendCard
          open={legendOpen}
          levels={[
            { key: "very_low", color: "#00e838" },
            { key: "low", color: "#a5eb02" },
            { key: "moderate", color: "#ebbb02" },
            { key: "high", color: "#f27200" },
            { key: "very_high", color: "#ff0000" },
          ]}
          cardRef={legendCardRef}
        />
      </div>
      {/* LoadingOverlay */}
      {loading && <LoadingOverlay message={t("message_loading")} />}
    </div>
  );
};

export default ForecastMapContainer;
