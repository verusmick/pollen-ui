"use client";
import React from "react";
import { useTranslations } from "next-intl";

interface PollenLegendProps {
  width?: number;
  height?: number;
}

const gradient = `linear-gradient(to right,
  rgba(0,100,0,0.9) 0%,
  rgba(154,205,50,0.9) 25%,
  rgba(255,255,0,0.9) 50%,
  rgba(255,165,0,0.9) 75%,
  rgba(255,0,0,0.9) 100%
)`;

export const PollenLegend = ({ width, height }: PollenLegendProps) => {
  const t = useTranslations("forecastPage.legend");

  const labels = [
    t("low"),
    t("moderate"),
    t("medium"),
    t("high"),
    t("very_high"),
  ];

  return (
    <div
      className="relative rounded overflow-hidden"
      style={{ width, height, background: gradient }}
    >
      <div className="absolute inset-0 flex justify-between items-center px-3">
        {labels.map((label, idx) => (
          <span
            key={idx}
            className="text-xs font-bold text-white"
            style={{
              textShadow:
                "1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
