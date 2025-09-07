import React from 'react';
import Link from 'next/link';
import { Linkedin, Instagram, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Logo */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center justify-center md:justify-start space-x-2 ">
              <img src="./footer-logo.png" alt="Footer Logo" />
            </Link>
          </div>

          {/* Services */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">{t('services')}</h3>
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
            <h3 className="text-lg font-semibold mb-4">{t('company')}</h3>
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
            <h3 className="text-lg font-semibold mb-4">{t('contactUs')}</h3>
            <h3 className="text-gray-300 hover:text-white transition-colors">
              {t('supportAndQueries')} <br />
              ( +91 766156671X)
            </h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href="https://www.linkedin.com/company/saarthiev-mobility/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                aria-label="Visit SaarthiEV Mobility on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/saarthievmobility/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                aria-label="Follow SaarthiEV Mobility on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/917661566710"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                aria-label="Chat with SaarthiEV Mobility on WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
