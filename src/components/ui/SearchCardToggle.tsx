"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

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
    <div className="absolute top-6 right-6 z-50 flex items-start gap-2">
      {open && (
        <div className="bg-card shadow-lg rounded-lg w-[300px] p-4 flex flex-col gap-2 mr-2">
          <h3 className="font-semibold text-white">{title}</h3>
          {children || <p className="text-white text-sm">contenido</p>}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="bg-card hover:bg-gray-900 text-white p-2 rounded-full shadow-lg focus:outline-none"
      >
        {open ? <X size={20} /> : <Search size={20} />}
      </button>
    </div>
  );
};
