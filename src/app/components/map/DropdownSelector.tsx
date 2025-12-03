'use client';

import { useEffect, useRef, useState } from 'react';
import { useClickOutside } from '@/app/forecast/hooks';
import { BiChevronDown } from 'react-icons/bi';

interface DropdownSelectorProps<T> {
  value?: T;
  onChange?: (value: T) => void;
  options?: T[];
  onToggle?: (open: boolean) => void;
  style?: React.CSSProperties;
}

export const DropdownSelector = <T extends { apiKey: string; label: string }>({
  value,
  onChange,
  onToggle,
  options = [],
  style,
}: DropdownSelectorProps<T>) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<T | null>(
    value ?? options[0] ?? null
  );

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  useEffect(() => {
    if (!value && options.length > 0) {
      setSelected(options[0]);
      onChange?.(options[0]);
      return;
    }
    const exists = options.some((opt) => opt.apiKey === value?.apiKey);
    if (!exists && options.length > 0) {
      setSelected(options[0]);
      onChange?.(options[0]);
    } else {
      setSelected(value ?? options[0] ?? null);
    }
  }, [value, options, onChange]);

  useEffect(() => onToggle?.(isOpen), [isOpen, onToggle]);

  const handleOptionClick = (pollen: T) => {
    setSelected(pollen);
    onChange?.(pollen);
    setIsOpen(false);
  };

  if (!selected) return null;

  return (
    <div
      ref={dropdownRef}
      style={style}
      className="bg-card backdrop-blur-sm shadow-lg rounded-lg p-1 w-[30vw] sm:w-[25vw] md:w-[20vw] lg:w-[15vw] xl:w-[16vw] 2xl:w-[15vw] z-50"
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-card text-white px-2 py-1 flex justify-between items-center rounded-md shadow-md text-base transition cursor-pointer"
      >
        <span>{selected.label}</span>
        <BiChevronDown
          className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && options.length > 0 && (
        <ul className="w-full bg-card rounded-lg shadow-lg max-h-60 overflow-auto border border-card mt-1 text-base">
          {options.map((item) => (
            <li
              key={item.apiKey}
              onClick={() => handleOptionClick(item)}
              className={`cursor-pointer px-2 py-1 hover:bg-neutral-700/40 transition ${
                item.apiKey === selected.apiKey
                  ? 'font-semibold bg-neutral-700 text-white'
                  : 'text-white'
              }`}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
