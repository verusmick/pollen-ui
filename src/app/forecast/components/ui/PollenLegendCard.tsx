'use client';
import React from 'react';
import { useTranslations } from 'next-intl';

interface PollenLegendCardProps {
  open: boolean;
  levels: {
    key: string;
    color: string;
    min: number;
    max: number | string;
    label: string;
  }[];
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export const PollenLegendCard = ({
  open,
  levels,
  cardRef,
}: PollenLegendCardProps) => {
  const t = useTranslations('forecastPage.legend');
  const p = useTranslations('forecastPage');

  return (
    <div
      ref={cardRef}
      className={`w-[320px] bg-card/80 text-white rounded-2xl shadow-lg p-4 backdrop-blur-md z-50 border border-none transition-all duration-300 ease-in-out ${
        open
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <div className="text-xs font-semibold flex justify-between mb-2">
        <span> {t('legend_title')}</span>
        <span className="text-right">{p('pollen')}</span>
      </div>

      <ul className="text-xs space-y-2">
        {levels.map((level, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-sm shrink-0"
              style={{ backgroundColor: level.color }}
            ></span>

            <span className="flex-1 min-w-20">
              <b>{t(level.key)}</b>
            </span>

            <span className="shrink-0 min-w-[50px] text-right">
              {level.min} - {level.max}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
