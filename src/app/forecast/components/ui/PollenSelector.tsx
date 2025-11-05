'use client';
import { useState, useRef, useEffect } from 'react';
import { BiChevronDown } from 'react-icons/bi';

import {
  POLLEN_ENTRIES,
  type PollenConfig,
  DEFAULT_POLLEN,
} from '@/app/forecast/constants';

interface PollenSelectorProps {
  value?: PollenConfig;
  onChange?: (value: PollenConfig) => void;
  onToggle?: (open: boolean) => void;
}

export const PollenSelector = ({
  value = DEFAULT_POLLEN,
  onChange,
  onToggle,
}: PollenSelectorProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<PollenConfig>(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    onToggle?.(isOpen);
  }, [isOpen, onToggle]);

  const handleOptionClick = (pollen: PollenConfig) => {
    setSelected(pollen);
    onChange?.(pollen);
    setIsOpen(false);
  };

  const handleToggle = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        p-1
        w-[30vw] sm:w-[25vw] md:w-[20vw] lg:w-[15vw] xl:w-[16vw] 2xl:w-[15vw]
        z-50
      "
    >
      <button
        onClick={handleToggle}
        className="
          w-full bg-card text-white px-2 py-1 flex justify-between items-center
          rounded-md shadow-md text-base
          transition cursor-pointer
        "
      >
        {selected.label}
        <BiChevronDown
          className={`w-4 h-4 text-white transform transition-transform ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {isOpen && (
        <ul className="w-full bg-card rounded-lg shadow-lg max-h-60 overflow-auto border border-card mt-1 text-base">
          {POLLEN_ENTRIES.map(({ key, label, apiKey, defaultBaseDate }) => (
            <li
              key={apiKey}
              onClick={() =>
                handleOptionClick({
                  apiKey,
                  label,
                  defaultBaseDate,
                } as PollenConfig)
              }
              className={`cursor-pointer px-2 py-1 hover:bg-neutral-700/40 transition ${
                apiKey === selected.apiKey
                  ? 'font-semibold bg-neutral-700 text-white'
                  : 'text-white'
              }`}
            >
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
