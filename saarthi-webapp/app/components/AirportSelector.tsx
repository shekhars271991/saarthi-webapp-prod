'use client';

import React, { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { airportConfig } from '../config/airports';

interface AirportSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  tripType: 'drop' | 'pickup';
}

const AirportSelector: React.FC<AirportSelectorProps> = ({
  value,
  onChange,
  label = "Airport",
  className = "",
  tripType
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const handleAirportSelect = (airport: string) => {
    onChange(airport);
    setShowDropdown(false);
  };

  const selectedAirportLabel = value 
    ? (airportConfig.airportDisplayNames[value as keyof typeof airportConfig.airportDisplayNames] || value)
    : (tripType === 'drop' ? 'Select Drop Terminal' : 'Select Pickup Terminal');

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
      >
        <div className="flex items-center">
          <MapPin className="w-5 h-5 text-gray-400 mr-3" />
          <span className={`text-sm md:text-base ${value ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedAirportLabel}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>
      
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {airportConfig.availableAirports.map((airport) => (
            <button
              key={airport}
              type="button"
              onClick={() => handleAirportSelect(airport)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm md:text-base ${
                value === airport ? 'bg-teal-50 text-teal-900' : 'text-gray-900'
              }`}
            >
              {airportConfig.airportDisplayNames[airport as keyof typeof airportConfig.airportDisplayNames] || airport}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AirportSelector;
