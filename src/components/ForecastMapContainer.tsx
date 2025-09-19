"use client";
import dynamic from "next/dynamic";
import { getForecastByCoords } from "@/lib/api/forecast";

const ForecastMap = dynamic(() => import("@/components/ForecastMap"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export const ForecastMapContainer = () => {
  // const [data, setData] = useState<any>(null);
  // const [forecastWithIntervals , setForecastWithIntervals] = useState<any>(null);
  // useEffect(() => {
  //   getForecastByCoords({
  //     from: 1649952000,
  //     to: 1649955599,
  //     pollen: "POLLEN_BIRCH",
  //     lon: 8.52,
  //     lat: 47.02,
  //   })
  //     .then(setData)
  //     .catch(console.error);

  //   getForecastWithIntervals({
  //     from: 1649952000,
  //     to: 1649955599,
  //     pollen: "POLLEN_BIRCH",
  //     intervals: '1,30,2,31,100,4,101,200,6,201,400,8,401,1000,9'
  //   })
  //     .then(setForecastWithIntervals)
  //     .catch(console.error);
  // }, []);
  return (
    <>
      {/* <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-gray-600">{t("description")}</p>

      <p className="text-1xl pt-3">Testing API</p> */}
      {/* <pre className="h-[120px] bg-gray-900 p-4 rounded-lg mt-4 overflow-x-auto">
        {data ? JSON.stringify(data, null, 2) : "Loading..."}
      </pre> */}
      {/* <pre className="bg-gray-900 p-4 rounded-lg mt-4 overflow-x-auto max-h-[200px]">
        {forecastWithIntervals ? JSON.stringify(forecastWithIntervals, null, 2) : "Loading..."}
      </pre> */}
      <ForecastMap />
    </>
  );
};
