import { useEffect, useRef, useState } from 'react';
import { BiChevronDown } from 'react-icons/bi';
import { useClickOutside } from '@/app/forecast/hooks';

interface DropdownSelectorProps<T> {
  value?: T;
  onChange?: (value: T) => void;
  onToggle?: (open: boolean) => void;
  options: T[];
  getLabel: (item: T) => string;
  getKey: (item: T) => string | number;
  style?: React.CSSProperties;
  width?: string;
}

export const DropdownSelector = <T,>({
  value,
  onChange,
  onToggle,
  options,
  getLabel,
  getKey,
  style,
  width = '15vw',
}: DropdownSelectorProps<T>) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<T | undefined>(value);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  useEffect(() => setSelected(value), [value]);
  useEffect(() => onToggle?.(isOpen), [isOpen, onToggle]);

  const handleOptionClick = (item: T) => {
    setSelected(item);  
    onChange?.(item);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      style={{ ...style, width }}
      className="bg-card backdrop-blur-sm shadow-lg rounded-lg p-1 z-50"
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-card text-white px-2 py-1 flex justify-between items-center rounded-md shadow-md text-base transition cursor-pointer"
      >
        {selected ? getLabel(selected) : 'Select...'}
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
              key={getKey(item)}
              onClick={() => handleOptionClick(item)}
              className={`cursor-pointer px-2 py-1 hover:bg-neutral-700/40 transition ${
                item === selected
                  ? 'font-semibold bg-neutral-700 text-white'
                  : 'text-white'
              }`}
            >
              {getLabel(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
