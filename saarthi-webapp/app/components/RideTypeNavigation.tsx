'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plane, Clock, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RideTypeNavigationProps {
  currentType: 'airport-transfer' | 'hourly-rental' | 'outstation';
  className?: string;
}

const RideTypeNavigation: React.FC<RideTypeNavigationProps> = ({ 
  currentType, 
  className = '' 
}) => {
  const router = useRouter();
  const { t } = useLanguage();

  const rideTypes = [
    {
      id: 'airport-transfer',
      label: t('airportTransfer') || 'Airport Rides',
      icon: Plane,
      path: '/airport-transfer',
      description: 'To/From Airport'
    },
    {
      id: 'hourly-rental',
      label: t('hourlyRental') || 'Day Trips',
      icon: Clock,
      path: '/hourly-rental',
      description: 'Hourly Rental'
    },
    {
      id: 'outstation',
      label: t('outstation') || 'Outstation',
      icon: MapPin,
      path: '/outstation',
      description: 'City to City'
    }
  ];

  const handleTabClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Navigation */}
      <div className="hidden md:flex bg-gray-100 rounded-xl p-1 mb-6">
        {rideTypes.map((type) => {
          const Icon = type.icon;
          const isActive = type.id === currentType;
          
          return (
            <button
              key={type.id}
              onClick={() => handleTabClick(type.path)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-white text-[#016B5D] shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#016B5D]' : 'text-gray-500'}`} />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden mb-6">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {rideTypes.map((type) => {
            const Icon = type.icon;
            const isActive = type.id === currentType;
            
            return (
              <button
                key={type.id}
                onClick={() => handleTabClick(type.path)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-lg font-medium text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#016B5D] shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#016B5D]' : 'text-gray-500'}`} />
                <span className="leading-tight text-center">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Type Indicator (Optional) */}
      <div className="hidden">
        {rideTypes.map((type) => {
          if (type.id === currentType) {
            return (
              <div key={type.id} className="text-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{type.label}</h2>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default RideTypeNavigation;
