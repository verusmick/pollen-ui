"use client";
import React from "react";
import { useTranslations } from "next-intl";

interface PollenLegendProps {
  width?: number;
  height?: number;
}

const gradient = `linear-gradient(to right,
  rgba(0,100,0,0.6) 0%,      
  rgba(154,205,50,0.6) 25%,   
  rgba(255,255,0,0.6) 50%,    
  rgba(255,165,0,0.6) 75%,   
  rgba(255,0,0,0.6) 100%     
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
            className="text-xs font-bold text-white drop-shadow-sm"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
