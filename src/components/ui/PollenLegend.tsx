"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

interface PollenLegendProps {
  width?: number;
  height?: number;
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
}: PollenLegendProps) => {
  const t = useTranslations("forecastPage.legend");
  const [open, setOpen] = useState(false);

  // Todos los niveles (incluye “none” al inicio)
  const levels = [
    { key: "none", color: "#ffffff" },
    { key: "very_low", color: "#00e838" },
    { key: "low", color: "#a5eb02" },
    { key: "moderate", color: "#ebbb02" },
    { key: "high", color: "#f27200" },
    { key: "very_high", color: "#ff0000" },
  ];

  // Filtramos los que se mostrarán en la barra (sin "none")
  const visibleLevels = levels.filter((level) => level.key !== "none");

  return (
    <div className="relative flex flex-col items-center">
      {/* Barra principal clickable */}
      <div
        className="relative rounded overflow-hidden cursor-pointer shadow-md border border-none hover:scale-[1.02] transition-transform"
        style={{ width, height, background: gradient }}
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="absolute inset-0 flex justify-between items-center px-3">
          {visibleLevels.map((level, idx) => (
            <span
              key={idx}
              className="text-[10px] font-bold text-white select-none"
              style={{
                textShadow:
                  "1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)",
              }}
            >
              {t(level.key)}
            </span>
          ))}
        </div>
      </div>

      {/* Card flotante (sí muestra “none”) */}
      <div
        className={`absolute bottom-full mb-3 w-[320px] bg-white/95 text-gray-800 rounded-2xl shadow-lg p-4 backdrop-blur-md z-50 border border-gray-200 transition-all duration-300 ease-in-out ${
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
              {/* Cuadro de color */}
              <span
                className="inline-block w-4 h-4 rounded-sm border border-gray-300"
                style={{ backgroundColor: level.color }}
              ></span>

              {/* Texto descriptivo */}
              <span>
                <b>{t(level.key)}:</b> {t(`${level.key}_leg`)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
