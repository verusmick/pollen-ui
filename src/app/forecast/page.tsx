import { useTranslations } from "next-intl";

import { ForecastMapContainer } from "@/components/ForecastMapContainer";

export default function ForecastPage() {
  const t = useTranslations("forecastPage");

  return (
    <main>
      <div className="w-screen h-screen rounded-lg flex items-center justify-center">
        <ForecastMapContainer />
      </div>
    </main>
  );
}
