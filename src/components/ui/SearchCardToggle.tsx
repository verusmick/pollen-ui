"use client";

import { useState } from "react";
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

  return (
    <div className="relative">
      {/* Card */}
      {open && (
        <div
          className="absolute top-0 right-12 bg-card shadow-lg rounded-lg w-[300px]
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
