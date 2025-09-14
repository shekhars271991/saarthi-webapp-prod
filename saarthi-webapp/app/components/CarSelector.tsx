'use client';

import React, { useState } from 'react';
import { Check, Users, Luggage } from 'lucide-react';
import { formatFare } from '../services/pricingService';

interface CarOption {
  id: string;
  name: string;
  image: string;
  type: string;
  capacity: number;
  luggage: number;
  fare: number;
  fareMultiplier: number;
  available: boolean;
  features?: string[];
}

interface CarSelectorProps {
  carOptions: CarOption[];
  selectedCarId: string | null;
  onCarSelect: (carId: string) => void;
  className?: string;
}

const CarSelector: React.FC<CarSelectorProps> = ({
  carOptions,
  selectedCarId,
  onCarSelect,
  className = ""
}) => {
  if (!carOptions || carOptions.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Select Your Car</h3>
      
      <div className="space-y-3">
        {carOptions.map((car) => (
          <div
            key={car.id}
            onClick={() => onCarSelect(car.id)}
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              selectedCarId === car.id
                ? 'border-teal-600 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            {/* Selection indicator */}
            {selectedCarId === car.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            <div className="flex items-center space-x-4">
              {/* Car Image */}
              <div className="flex-shrink-0 w-20 h-16 md:w-24 md:h-18">
                <img
                  src={`/${car.image}`}
                  alt={car.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-car.png'; // Fallback image
                  }}
                />
              </div>

              {/* Car Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                    {car.name}
                  </h4>
                  <div className="text-right">
                    <div className="text-lg md:text-xl font-bold text-gray-900">
                      ₹{formatFare(car.fare)}
                    </div>
                    {car.fareMultiplier !== 1.0 && (
                      <div className="text-xs text-gray-500">
                        {car.fareMultiplier < 1.0 ? 'Save' : 'Premium'} {Math.abs((car.fareMultiplier - 1) * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Car Specifications */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{car.capacity} seats</span>
                  </div>
                  <div className="flex items-center">
                    <Luggage className="w-4 h-4 mr-1" />
                    <span>{car.luggage} bags</span>
                  </div>
                  <div className="capitalize text-gray-500">
                    {car.type}
                  </div>
                </div>

                {/* Features */}
                {car.features && car.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {car.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Availability indicator */}
            {!car.available && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-75 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 font-medium">Not Available</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      {selectedCarId && (
        <div className="mt-4 p-3 bg-teal-50 rounded-md border border-teal-200">
          <div className="flex items-center text-teal-800">
            <Check className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {carOptions.find(car => car.id === selectedCarId)?.name} selected
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarSelector;
