'use client';

import Image from 'next/image';

interface PanelHeaderProps {
  title?: string;
  iconSrc: string;
}

export const PanelHeader = ({ title, iconSrc }: PanelHeaderProps) => {
  return (
    <div className="
        bg-card backdrop-blur-sm shadow-lg rounded-lg
        p-2
        w-[30vw] sm:w-[25vw] md:w-[20vw] lg:w-[15vw] xl:w-[16vw] 2xl:w-[15vw]
        z-50 flex flex-row items-center gap-2
      ">
      <Image
        src={iconSrc}
        alt="Header icon"
        width={24}
        height={24}
        className="
          rounded-sm
          w-[8vw] sm:w-[6vw] md:w-[4vw] lg:w-[3vw] xl:w-[2vw] 2xl:w-[1.8vw]
          h-auto
        "
      />
      <h3 className="text-white truncate text-base font-medium">{title}</h3>
    </div>
  );
};
