"use client";

import Image from "next/image";

interface ForecastHeaderProps {
  title?: string;
  iconSrc?: string;
}

export const ForecastHeader = ({
  title = "Forecast Map",
  iconSrc = "/zaum.png",
}: ForecastHeaderProps) => {
  return (
    <div
      className="absolute top-6 left-6 bg-card backdrop-blur-sm shadow-lg 
                 rounded-lg p-2 w-[160px] z-50 flex flex-col gap-2"
    >
      <div className="flex items-center gap-2">
        <Image
          src={iconSrc}
          alt="Forecast icon"
          width={32}
          height={28}
          className="rounded-sm"
        />
        <h3 className="text-sm text-white">{title}</h3>
      </div>
    </div>
  );
};
