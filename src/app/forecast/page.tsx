"use client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  getForecastByCoords,
  getForecastWithIntervals,
} from "@/lib/api/forecast";

export default function ForecastPage() {
  const t = useTranslations("forecastPage");
  const [data, setData] = useState<any>(null);
  // const [forecastWithIntervals , setForecastWithIntervals] = useState<any>(null);
  useEffect(() => {
    getForecastByCoords({
      from: 1649952000,
      to: 1649955599,
      pollen: "POLLEN_BIRCH",
      lon: 8.52,
      lat: 47.02,
    })
      .then(setData)
      .catch(console.error);

    // getForecastWithIntervals({
    //   from: 1649952000,
    //   to: 1649955599,
    //   pollen: "POLLEN_BIRCH",
    //   intervals: '1,30,2,31,100,4,101,200,6,201,400,8,401,1000,9'
    // })
    //   .then(setForecastWithIntervals)
    //   .catch(console.error);
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-gray-600">{t("description")}</p>

      <p className="text-1xl pt-3">Testing API</p>
      <pre className="bg-gray-900 p-4 rounded-lg mt-4 overflow-x-auto">
        {data ? JSON.stringify(data, null, 2) : "Loading..."}
      </pre>
      {/* <pre className="bg-gray-900 p-4 rounded-lg mt-4 overflow-x-auto max-h-[200px]">
        {forecastWithIntervals ? JSON.stringify(forecastWithIntervals, null, 2) : "Loading..."}
      </pre> */}

      <div className="mt-6 h-[500px] w-full rounded-lg bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">[Map goes here]</span>
      </div>
    </main>
  );
}
