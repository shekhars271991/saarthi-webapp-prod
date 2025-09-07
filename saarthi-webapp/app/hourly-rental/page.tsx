'use client';

import React from 'react';
import HourlyRental from '../../app/components/HourlyRental';
import Header from '../components/Header';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HourlyRentalPage = () => {
  const router = useRouter();

  useEffect(() => {
    
  }, [router]);

  return( <div className="min-h-screen bg-white">
      <Header/>
      <HourlyRental />
    </div>);
};

export default HourlyRentalPage;
