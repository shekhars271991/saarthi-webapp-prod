'use client';

import React from 'react';
import { Plane } from 'lucide-react';

const services = [
  {
    title: 'Effortless Airport Journeys',
    description: 'Relax or work while we handle your airport commute. Punctual pickups and drops with professional drivers.',
  },
  {
    title: 'Effortless Airport Journeys',
    description: 'Relax or work while we handle your airport commute. Punctual pickups and drops with professional drivers.',
  },
  {
    title: 'Effortless Airport Journeys',
    description: 'Relax or work while we handle your airport commute. Punctual pickups and drops with professional drivers.',
  },
  {
    title: 'Effortless Airport Journeys',
    description: 'Relax or work while we handle your airport commute. Punctual pickups and drops with professional drivers.',
  },
];

const OurServices = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
      <h2 className="text-3xl font-semibold mb-10 text-center">Our services</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {services.map((service, index) => (
          <div key={index} className="flex space-x-4 p-4 border rounded-md shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-md p-2">
              <Plane className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{service.title}</h3>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurServices;
