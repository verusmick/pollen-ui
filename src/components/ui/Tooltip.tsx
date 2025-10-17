"use client";

import { ReactNode } from "react";

interface TooltipProps {
  text: string;
  position?: "left" | "right" | "top" | "bottom";
  className?: string;
  children: ReactNode;
  visible?: boolean;
}

export const Tooltip = ({
  text,
  position = "left",
  className = "",
  children,
  visible = true,
}: TooltipProps) => {
  const baseClasses = `
    whitespace-nowrap bg-card text-white text-base font-semibold px-3 py-2 
    rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 
    pointer-events-none shadow-md z-50
    after:content-[''] after:absolute after:border-6 after:border-transparent
    max-w-xs
  `;

  const positionClasses =
    position === "left"
      ? "absolute right-full top-1/2 -translate-y-1/2 mr-2 after:left-full after:top-1/2 after:-translate-y-1/2 after:border-l-card"
      : position === "right"
      ? "absolute left-full top-1/2 -translate-y-1/2 ml-2 after:right-full after:top-1/2 after:-translate-y-1/2 after:border-r-card"
      : position === "top"
      ? "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 after:top-full after:left-1/2 after:-translate-x-1/2 after:border-t-card"
      : "absolute top-full left-1/2 -translate-x-1/2 mt-2 after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-b-card";

  if (!visible) return <>{children}</>;

  return (
    <div className="relative group inline-flex items-center">
      {children}
      <span className={`${baseClasses} ${positionClasses} ${className}`}>
        {text}
      </span>
    </div>
  );
};
