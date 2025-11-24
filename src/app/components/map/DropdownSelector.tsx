import {
  DEFAULT_POLLEN,
  POLLEN_ENTRIES,
  type PollenConfig,
} from '@/app/forecast/constants';
import { useEffect, useRef, useState } from 'react';
import { useClickOutside } from '@/app/forecast/hooks';
import { BiChevronDown } from 'react-icons/bi';

interface DropdownSelectorProps {
  value?: PollenConfig;
  onChange?: (value: PollenConfig) => void;
  onToggle?: (open: boolean) => void;
  options?: PollenConfig[];
  style?: React.CSSProperties;
}
export const DropdownSelector = ({
  value = DEFAULT_POLLEN,
  onChange,
  onToggle,
  options = POLLEN_ENTRIES,
  style,
}: DropdownSelectorProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<PollenConfig>(value);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  useEffect(() => setSelected(value), [value]);
  useEffect(() => onToggle?.(isOpen), [isOpen, onToggle]);

  const handleOptionClick = (pollen: PollenConfig) => {
    setSelected(pollen);
    onChange?.(pollen);
    setIsOpen(false);
  };
  return (
    <div
      ref={dropdownRef}
      style={style}
      className="bg-card backdrop-blur-sm shadow-lg rounded-lg p-1
                 w-[30vw] sm:w-[25vw] md:w-[20vw] lg:w-[15vw] xl:w-[16vw] 2xl:w-[15vw] z-50"
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-card text-white px-2 py-1 flex justify-between items-center
                   rounded-md shadow-md text-base transition cursor-pointer"
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
