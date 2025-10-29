import { ForecastMapContainer } from "@/app/forecast/components";

export default function ForecastPage() {
  return (
    <main>
      <div className="w-screen h-screen rounded-lg flex items-center justify-center">
        <ForecastMapContainer />
      </div>
    </main>
  );
}
