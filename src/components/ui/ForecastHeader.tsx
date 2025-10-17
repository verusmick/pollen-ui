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
      className="
        absolute top-6 left-6
        sm:top-8 sm:left-8
        md:top-8 md:left-8
        lg:top-8 lg:left-8
        xl:top-8 xl:left-8
        2xl:top-10 2xl:left-10
        bg-card backdrop-blur-sm shadow-lg rounded-lg
        p-2
        w-[30vw] sm:w-[25vw] md:w-[20vw] lg:w-[15vw] xl:w-[16vw] 2xl:w-[15vw]
        z-50 flex flex-col sm:flex-row items-center gap-2
      "
    >
      <Image
        src={iconSrc}
        alt="Forecast icon"
        width={24}
        height={24}
        className="
          rounded-sm
          w-[8vw] sm:w-[6vw] md:w-[4vw] lg:w-[3vw] xl:w-[2.5vw] 2xl:w-[2vw]
          h-auto
        "
      />
      <h3
        className="
          text-white truncate text-base max-w-[60%]"
      >
        {title}
      </h3>
    </div>
  );
};
