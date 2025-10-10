"use client";

import { useState, useRef, useEffect } from "react";
import { BiChevronDown } from "react-icons/bi";

interface ForecastSelectorProps {
  options: string[];
  selected?: string;
  onChange?: (value: string) => void;
}

export const PollenSelector = ({
  options,
  selected,
  onChange,
}: ForecastSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(selected || options[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    onChange?.(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-card text-white px-2 py-2 flex justify-between items-center shadow-md transition text-xs ${
          isOpen ? "rounded-t-lg" : "rounded-lg"
        }`}
      >
        {selectedOption}
        <BiChevronDown
          className={`w-4 h-4 text-white transform transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {isOpen && (
        <ul className="w-full bg-card rounded-b-lg shadow-lg max-h-60 overflow-auto border border-card text-xs">
          {options.map((opt) => (
            <li
              key={opt}
              onClick={() => handleOptionClick(opt)}
              className={`cursor-pointer px-2 py-2 hover:bg-neutral-700/40 hover:text-white transition ${
                opt === selectedOption
                  ? "font-bold bg-neutral-700"
                  : "text-white"
              }`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
