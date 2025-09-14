"use client";

import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Clock, Car } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '../contexts/LanguageContext';

export default function Homepage() {
  const { t } = useLanguage();



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-cover bg-top bg-no-repeat overflow-visible h-screen" style={{ 
        backgroundImage: 'url(/bodh-gaya3.jpeg)',
        backgroundPosition: 'center top',
        backgroundSize: 'cover'
      }}>
        {/* Content wrapper to contain all elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Responsive background adjustments */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>
          {/* Dark overlay for better text readability */}
          <div className="hidden absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-start pt-32 sm:pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Content */}
            <div className="space-y-3">
              {/* Promotional Banner */}
              {/* <div className="inline-block bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                {t('promotionalBanner')}
              </div> */}

              {/* Main Heading */}
              <div className="space-y-1">
                <h1 className="text-xl lg:text-4xl font-bold text-white leading-tight">
                  {t('mainHeading')}
                </h1>
                <h2 className="text-xl lg:text-4xl font-bold text-white leading-tight">
                  {t('mainHeadingHighlight')}
                </h2>
                <h3 className="text-xl lg:text-4xl font-bold text-white leading-tight">
                  {t('subHeading')}
                </h3>
                {/* <p className="text-base text-gray-100 max-w-lg">
                  {t('description')}
                </p> */}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-1 text-center lg:text-left">
                <div className="text-white py-1 rounded-full text-[16px] font-medium inline-flex items-center space-x-2 transition-colors">
                  <span className="animate-[blink_1s_ease-in-out_infinite]">{t('bookNow')}</span>
                  <Sparkles className="w-3 h-3 animate-[blink_1s_ease-in-out_infinite]" />
                </div>

                {/* Service Buttons */}
<div className="flex flex-col gap-2 pt-1 justify-center lg:justify-start">
  {/* First Row - Airport Transfer and Hourly Rental */}
  <div className="flex gap-2">
    <a 
      href="/airport-transfer" 
      className={`px-6 py-3 rounded-full text-[14px] sm:text-[14px] lg:text-[18px] font-medium inline-flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 ${
        process.env.NEXT_PUBLIC_AIRPORT_TRANSFER_ENABLED === 'true' 
          ? 'bg-[#016B5D] hover:bg-teal-700 text-white' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
      {...(process.env.NEXT_PUBLIC_AIRPORT_TRANSFER_ENABLED !== 'true' && { disabled: true })}
    >
      <MapPin className="w-5 h-5" />
      <span>{t('airportTransfer')}</span>
    </a>
    <a 
      href="/hourly-rental" 
      className={`px-6 py-3 rounded-full text-[14px] sm:text-[14px] lg:text-[18px] font-medium inline-flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 ${
        process.env.NEXT_PUBLIC_HOURLY_RENTAL_ENABLED === 'true' 
          ? 'bg-[#016B5D] hover:bg-teal-700 text-white' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
      {...(process.env.NEXT_PUBLIC_HOURLY_RENTAL_ENABLED !== 'true' && { disabled: true })}
    >
      <Clock className="w-5 h-5" />
      <span>{t('hourlyRental')}</span>
    </a>
  </div>
  
  {/* Second Row - Outstation Trip */}
  <div className="flex justify-start">
    <a 
      href="/outstation" 
      className={`px-6 py-3 rounded-full text-[14px] sm:text-[14px] lg:text-[18px] font-medium inline-flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 ${
        process.env.NEXT_PUBLIC_OUTSTATION_ENABLED === 'true' 
          ? 'bg-[#016B5D] hover:bg-teal-700 text-white' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
      {...(process.env.NEXT_PUBLIC_OUTSTATION_ENABLED !== 'true' && { disabled: true })}
    >
      <Car className="w-5 h-5" />
      <span>{t('outstationTrip')}</span>
    </a>
  </div>
</div>
              </div>
            </div>

            {/* <div className="relative ml-24 lg:ml-48">
              <div className="relative z-10">
                <Image
                  src="/hro.png"
                  alt="Professional chauffeur car"
                  width={800}
                  height={600}
                  className="rounded-2xl "
                />
              </div>
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-teal-100 rounded-full opacity-20 -z-10"></div>
              <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-orange-100 rounded-full opacity-20 -z-10"></div>
            </div> */}
          </div>
        </div>
        </div>
      </section>

      {/* Why Book From Us Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t('whySaarthiEV')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('whySaarthiEVSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Safety Focused */}
            <div className="group">
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl text-center group-hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('safetyFocused')}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {t('safetyFocusedDescription')}
                </p>
              </div>
            </div>

            {/* Affordable */}
            <div className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl text-center group-hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('affordable')}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {t('affordableDescription')}
                </p>
              </div>
            </div>

            {/* Reliable */}
            <div className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl text-center group-hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('reliable')}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {t('reliableDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
