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
  const [data, setData] = useState<Array<{ long: number; lat: number; value: number }>>([]);
  const [longitudes, setLongitudes] = useState<number[]>([]);
  const [latitudes, setLatitudes] = useState<number[]>([]);
  const [selectedHour, setSelectedHour] = useState(0);
  const [allData1, setAllData1] = useState<{ long: number; lat: number; value: number }[][]>([]);
  const pollenType = "POLLEN_BIRCH";
  const from = 1649894400; // April 1, 2022 00:00:0ƒ0
  const to = from + 59 * 60 + 59; // April 1, 2022 00:59:59

  let allData: { long: number; lat: number; value: number }[][] = [];

  function addData(forecasts: number[], longs: number[], lats: number[], hour: number) {
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
        console.log("getForecastByCoords", res);
        addData(res, longs, lats, 0);
        setLongitudes(longs);
        setLatitudes(lats);
        setData(allData[0]);
        // console.log("initial data loaded", allData[0]);
        // return loadAllData(longs, lats);
      });
    //   .then((res) => {
    //     setLoading(false);
    //     console.log("all data loaded", allData);
    //   })
    //   .catch((err) => {
    //     console.error("Failed to load data:", err);
    //     setLoading(false);
    //   });
  }

  useEffect(() => {
    loadInitialData();
  }, []);
  return (
    <>
      <ForecastMap pollenData={data} />
    </>
  );
};
