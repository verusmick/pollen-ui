import { useTranslations } from "next-intl";

export default function ForecastPage() {
  const t = useTranslations("forecastPage");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-gray-600">{t("description")}</p>

      <div className="mt-6 h-[500px] w-full rounded-lg bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">[Map goes here]</span>
      </div>
    </main>
  );
}
