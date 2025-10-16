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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="
        absolute top-20 left-6
        sm:top-8 sm:left-8
        md:top-8 md:left-8
        lg:top-8 lg:left-8
        xl:top-6 xl:left-8
        2xl:top-10 2xl:left-10
        bg-card backdrop-blur-sm shadow-lg rounded-lg
        p-1 w-[30vw] sm:w-[25vw] md:w-[20vw] lg:w-[15vw] xl:w-[16vw] 2xl:w-[15vw]
        z-50 flex flex-col gap-1
      "
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full bg-card text-white px-2 py-2 flex justify-between items-center
          rounded-lg shadow-md text-xs sm:text-sm md:text-base lg:text-sm xl:text-lg 2xl:text-lg
          transition
        `}
      >
        {selectedOption}
        <BiChevronDown
          className={`w-4 h-4 text-white transform transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {isOpen && (
        <ul className="w-full bg-card rounded-b-lg shadow-lg max-h-60 overflow-auto border border-card text-xs sm:text-sm md:text-base lg:text-sm xl:text-lg 2xl:text-lg">
          {options.map((opt) => (
            <li
              key={opt}
              onClick={() => handleOptionClick(opt)}
              className={`cursor-pointer px-2 py-2 hover:bg-neutral-700/40 hover:text-white transition ${
                opt === selectedOption ? "font-bold bg-neutral-700" : "text-white"
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
