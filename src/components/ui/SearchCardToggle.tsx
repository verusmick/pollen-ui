"use client";
import { useState, useRef, useEffect } from "react";
import { BiSearch, BiX } from "react-icons/bi";
import { Tooltip } from "./Tooltip";

interface SearchCardToggleProps {
  title?: string;
  children?: React.ReactNode;
}

export const SearchCardToggle = ({
  title = "Search",
  children,
}: SearchCardToggleProps) => {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative">
      {/* Card */}
      {open && (
        <div
          ref={cardRef}
          className="
            absolute top-0 right-12
            bg-card/80 backdrop-blur-sm shadow-lg rounded-lg
            w-[60vw] sm:w-[40vw] md:w-[30vw] lg:w-[25vw] xl:w-[25vw] 2xl:w-[20vw]
            p-4 flex flex-col gap-3
            border border-white/10
            z-50 transition-all duration-200
          "
        >
          <h3
            className="
              font-semibold text-white text-[16px]
              border-b border-white/10 pb-2 mb-2
            "
          >
            {title}
          </h3>
          <div className="text-white">{children}</div>
        </div>
      )}

      {/* Botón flotante */}
      <Tooltip text={title} position="left" visible={!open}>
        <button
          onClick={() => setOpen(!open)}
          className="
            bg-card backdrop-blur-sm hover:bg-neutral-800 text-white
            p-3 rounded-full shadow-lg focus:outline-none transition
            border border-white/10
          "
        >
          {open ? <BiX size={20} /> : <BiSearch size={20} />}
        </button>
      </Tooltip>
    </div>
  );
};
