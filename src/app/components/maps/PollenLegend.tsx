import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';

interface PollenLegendProps {
  width?: number;
  height?: number;
  onToggle?: (open: boolean) => void;
}

const gradient = `linear-gradient(to right,
  rgb(255, 255, 0) 0%,
  rgb(255, 255, 0) 20%,
  rgb(255, 165, 0) 20%,
  rgb(255, 165, 0) 40%,
  rgb(255, 0, 0) 40%,
  rgb(255, 0, 0) 60%,
  rgb(128, 0, 128) 60%,
  rgb(128, 0, 128) 80%,
  rgb(0, 0, 139) 80%,
  rgb(0, 0, 139) 100%
)`;

export const PollenLegend = ({
  width = 350,
  height = 25,
  onToggle,
}: PollenLegendProps) => {
  const t = useTranslations('Components.legend');
  const barRef = useRef<HTMLDivElement>(null);

  const levels = [
    { key: 'none', color: 'transparent' },
    { key: 'very_low', color: 'rgb(255, 255, 0)' },
    { key: 'low', color: 'rgb(255, 165, 0)' },
    { key: 'moderate', color: 'rgb(255, 0, 0)' },
    { key: 'high', color: 'rgb(128, 0, 128)' },
    { key: 'very_high', color: 'rgb(0, 0, 139)' },
  ];
  const visibleLevels = levels.filter((level) => level.key !== 'none');

  return (
    <div className="relative flex flex-col items-center">
      <div
        ref={barRef}
        className="relative rounded overflow-hidden cursor-pointer shadow-md border border-none hover:scale-[1.02] transition-transform"
        style={{ width, height, background: gradient }}
        onClick={() => onToggle?.(true)}
      >
        <div className="absolute inset-0 grid grid-cols-5 items-center">
          {visibleLevels.map((level, idx) => (
            <span
              key={idx}
              className="text-center text-[10px] font-bold text-white select-none"
              style={{
                textShadow:
                  '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)',
              }}
            >
              {t(level.key)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
