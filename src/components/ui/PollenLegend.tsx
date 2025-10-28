"use client";
import React, { useState, useRef, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        barRef.current &&
        !barRef.current.contains(target) &&
        cardRef.current &&
        !cardRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const levels = [
    { key: "none", color: "#ffffff" },
    { key: "very_low", color: "#00e838" },
    { key: "low", color: "#a5eb02" },
    { key: "moderate", color: "#ebbb02" },
    { key: "high", color: "#f27200" },
    { key: "very_high", color: "#ff0000" },
  ];

  const visibleLevels = levels.filter((level) => level.key !== "none");

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!barRef.current || !cardRef.current) return;

      const { clientX: x, clientY: y } = event;

      const barRect = barRef.current.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();

      const padding = 20; 

      const insideBar =
        x >= barRect.left - padding &&
        x <= barRect.right + padding &&
        y >= barRect.top - padding &&
        y <= barRect.bottom + padding;

      const insideCard =
        x >= cardRect.left - padding &&
        x <= cardRect.right + padding &&
        y >= cardRect.top - padding &&
        y <= cardRect.bottom + padding;

      if (!insideBar && !insideCard) {
        setOpen(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative flex flex-col items-center" ref={containerRef}>
      <div
        ref={barRef}
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
      
      {/* Card */}
      <div
        ref={cardRef}
        className={`absolute bottom-full mb-3 w-[320px] bg-card/80 text-white rounded-2xl shadow-lg p-4 backdrop-blur-md z-50 border border-none transition-all duration-300 ease-in-out ${
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
    </div>
  );
};
