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

  // Detect click outside the card
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative">
      {/* Card */}
      {open && (
        <div
          ref={cardRef}
          className="absolute top-0 right-12 bg-card/80 shadow-lg rounded-lg w-[400px]
                     p-4 flex flex-col gap-2 z-50"
        >
          <h3 className="font-semibold text-white">{title}</h3>
          {children}
        </div>
      )}

      <Tooltip text={title} position="left" visible={!open}>
        <button
          onClick={() => setOpen(!open)}
          className="bg-card hover:bg-neutral-800 text-white
                     p-2 rounded-full shadow-lg focus:outline-none"
        >
          {open ? <BiX size={20} /> : <BiSearch size={20} />}
        </button>
      </Tooltip>
    </div>
  );
};
