'use client';

import React from 'react';
import AirportTransfer from '../../app/components/AirportTransfer';
import Header from '../components/Header';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AirportTransferPage = () => {
  const router = useRouter();

  useEffect(() => {
    
  }, [router]);

  return( <div className="min-h-screen bg-white">
      <Header/>
      <AirportTransfer />
    </div>);
};

export default AirportTransferPage;
