"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Option = {
  value: any;
  label: string;
};

interface CustomSelectProps {
  items: Option[];
  onChange: (value: any) => void;
  placeholder?: string;
  error?: string;
}

export default function CustomSelect({ items, onChange, placeholder = "Select an option", error }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(null);

  const handleSelect = (item: Option) => {
    setSelected(item);
    onChange(item.value);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-sm">
      <button
        type="button"
        className="w-full bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2 text-left text-gray-700 flex justify-between items-center hover:border-gray-400 focus:outline-none"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {error && error !== "" && <div className="text-red-500 text-sm mt-2">{error}</div>}

      {isOpen && (
        <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {items.map((item) => (
            <li key={item.value} onClick={() => handleSelect(item)} className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-800">
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
