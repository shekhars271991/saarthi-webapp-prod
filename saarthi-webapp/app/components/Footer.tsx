import React from 'react';
import Link from 'next/link';
import { Linkedin, Instagram, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Mobile Layout - Compact */}
        <div className="block md:hidden">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <img src="./footer-logo.png" alt="SaarthiEV Logo" className="h-40 mx-auto" />
            </Link>
          </div>

          {/* Links in 2 columns */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
            {/* Services */}
            <div>
              <h3 className="font-semibold mb-3 text-white">{t('services')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/airport-transfer" className="text-gray-300 hover:text-white transition-colors">
                    {t('airportTransfers')}
                  </Link>
                </li>
                <li>
                  <Link href="/hourly-rental" className="text-gray-300 hover:text-white transition-colors">
                    {t('cityRentals')}
                  </Link>
                </li>
                <li>
                  <Link href="/outstation" className="text-gray-300 hover:text-white transition-colors">
                    {t('outstationTrips')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-3 text-white">{t('company')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about-us" className="text-gray-300 hover:text-white transition-colors">
                    {t('aboutUs')}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-and-policy" className="text-gray-300 hover:text-white transition-colors">
                    {t('privacyAndPolicy')}
                  </Link>
                </li>
                <li>
                  <Link href="/cancellation-refund" className="text-gray-300 hover:text-white transition-colors">
                    {t('cancellationRefund')}
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="text-gray-300 hover:text-white transition-colors">
                    {t('termsAndConditions')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact and Social */}
          <div className="text-center">
            <p className="text-gray-300 text-sm mb-3">
              {t('supportAndQueries')} <br />
              <span className="text-white">+91 766156671X</span>
            </p>
            <div className="flex justify-center space-x-3 mb-4">
              <a
                href="https://www.linkedin.com/company/saarthiev-mobility/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Visit SaarthiEV Mobility on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/saarthievmobility/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Follow SaarthiEV Mobility on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/917661566710"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Chat with SaarthiEV Mobility on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 text-left">
          {/* Logo */}
          <div className="col-span-1">
            <Link href="/" className="inline-block mb-4">
              <img src="./footer-logo.png" alt="SaarthiEV Logo" className="h-48" />
            </Link>
          </div>

          {/* Services */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">{t('services')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/airport-transfer" className="text-gray-300 hover:text-white transition-colors">
                  {t('airportTransfers')}
                </Link>
              </li>
              <li>
                <Link href="/hourly-rental" className="text-gray-300 hover:text-white transition-colors">
                  {t('cityRentals')}
                </Link>
              </li>
              <li>
                <Link href="/outstation" className="text-gray-300 hover:text-white transition-colors">
                  {t('outstationTrips')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">{t('company')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about-us" className="text-gray-300 hover:text-white transition-colors">
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/privacy-and-policy" className="text-gray-300 hover:text-white transition-colors">
                  {t('privacyAndPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/cancellation-refund" className="text-gray-300 hover:text-white transition-colors">
                  {t('cancellationRefund')}
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-gray-300 hover:text-white transition-colors">
                  {t('termsAndConditions')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">{t('contactUs')}</h3>
            <p className="text-gray-300 mb-4">
              {t('supportAndQueries')} <br />
              <span className="text-white font-medium">+91 766156671X</span>
            </p>
            <div className="flex space-x-3">
              <a
                href="https://www.linkedin.com/company/saarthiev-mobility/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Visit SaarthiEV Mobility on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/saarthievmobility/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Follow SaarthiEV Mobility on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/917661566710"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Chat with SaarthiEV Mobility on WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-4 md:pt-8 text-center">
          <p className="text-gray-400 text-sm md:text-base">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
