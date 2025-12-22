import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';

interface PollenLegendProps {
  width?: number;
  height?: number;
  onToggle?: (open: boolean) => void;
}

const gradient = `linear-gradient(to right,
  rgb(0, 232, 56) 0%,
  rgb(165, 235, 2) 25%,
  rgb(235, 187, 2) 50%,
  rgb(242, 114, 0) 75%,
  rgb(255, 0, 0) 100%
)`;

export const PollenLegend = ({
  width = 350,
  height = 25,
  onToggle,
}: PollenLegendProps) => {
  const t = useTranslations('Components.legend');
  const barRef = useRef<HTMLDivElement>(null);

  const levels = [
    { key: 'none', color: '#ffffff' },
    { key: 'very_low', color: '#00e838' },
    { key: 'low', color: '#a5eb02' },
    { key: 'moderate', color: '#ebbb02' },
    { key: 'high', color: '#f27200' },
    { key: 'very_high', color: '#ff0000' },
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
        <div className="absolute inset-0 flex justify-between items-center px-3">
          {visibleLevels.map((level, idx) => (
            <span
              key={idx}
              className="text-[10px] font-bold text-white select-none"
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
