'use client';

import React, { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

interface HoursSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const HoursSelector: React.FC<HoursSelectorProps> = ({
  value,
  onChange,
  label = "Hours",
  className = ""
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const hoursOptions = [
    { value: '1', label: '1 hour' },
    { value: '2', label: '2 hours' },
    { value: '3', label: '3 hours' },
    { value: '4', label: '4 hours' },
    { value: '5', label: '5 hours' },
    { value: '6', label: '6 hours' },
    { value: '8', label: '8 hours' },
    { value: '10', label: '10 hours' },
    { value: '12', label: '12 hours' }
  ];

  const handleHourSelect = (hours: string) => {
    onChange(hours);
    setShowDropdown(false);
  };

  const selectedHourLabel = value 
    ? hoursOptions.find(option => option.value === value)?.label || `${value} hours`
    : 'Select Hours';

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
      >
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-gray-400 mr-3" />
          <span className={`text-sm md:text-base ${value ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedHourLabel}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>
      
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {hoursOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleHourSelect(option.value)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm md:text-base ${
                value === option.value ? 'bg-teal-50 text-teal-900' : 'text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HoursSelector;
