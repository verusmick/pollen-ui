"use client";
import React from "react";
import { useTranslations } from "next-intl";

interface PollenLegendCardProps {
  open: boolean;
  levels: { key: string; color: string }[];
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export const PollenLegendCard = ({
  open,
  levels,
  cardRef,
}: PollenLegendCardProps) => {
  const t = useTranslations("forecastPage.legend");

  return (
    <div
      ref={cardRef}
      className={`w-[320px] bg-card/80 text-white rounded-2xl shadow-lg p-4 backdrop-blur-md z-50 border border-none transition-all duration-300 ease-in-out ${
        open
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <h3 className="text-sm font-semibold mb-3 text-left">
        {t("legend_title") ?? "Niveles de concentración de polen"}
      </h3>

      <ul className="text-xs space-y-2">
        {levels.map((level, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span
              className="inline-block w-4 h-4 rounded-sm border border-none"
              style={{ backgroundColor: level.color }}
            ></span>
            <span>
              <b>{t(level.key)}:</b> {t(`${level.key}_leg`)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
