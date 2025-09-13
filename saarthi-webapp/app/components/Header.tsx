'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Menu, X, User, Home, Globe, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProfileInfo from './ProfileInfo';
import { useLanguage } from '../contexts/LanguageContext';
import { cityConfig } from '../config/cities';
import toast from 'react-hot-toast';




const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCity, setSelectedCity] = useState(cityConfig.availableCities[0]); // Default to first available city
  const { language, setLanguage, setLanguageByCity, reloadLanguage, t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
      
      // Load city preference from localStorage
      const savedCity = localStorage.getItem('selectedCity');
      if (savedCity && cityConfig.availableCities.includes(savedCity)) {
        setSelectedCity(savedCity);
        
        // Only set city-based language if no manual language preference exists
        const savedLanguage = localStorage.getItem('language');
        if (!savedLanguage) {
          setLanguageByCity(savedCity);
        } else {
          // If language preference exists, respect it and don't override
          reloadLanguage();
        }
      } else {
        // If no city is saved, reload the language from localStorage
        reloadLanguage();
      }
    }

    // Handle language persistence on page focus/navigation
    const handleFocus = () => {
      reloadLanguage();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        reloadLanguage();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', () => {
        if (!document.hidden) {
          reloadLanguage();
        }
      });
    };
  }, [reloadLanguage, setLanguageByCity]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'hi' | 'en');
  };

  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    localStorage.setItem('selectedCity', newCity);
    
    // Auto-switch language based on city selection
    const previousLanguage = language;
    setLanguageByCity(newCity);
    
    // Show toast notification for language change
    const cityLanguage = cityConfig.cityLanguageMapping[newCity as keyof typeof cityConfig.cityLanguageMapping];
    if (cityLanguage && previousLanguage !== cityLanguage) {
      toast.success(`Language switched to ${cityConfig.languageDisplayNames[cityLanguage]} for ${cityConfig.cityDisplayNames[newCity as keyof typeof cityConfig.cityDisplayNames]}`);
    }
  };

  // Remove the useEffect for outside click handling
  // No need to add event listeners for closing dropdown on outside clicks

  const handleLogout = () => {
    console.log('Logout function called'); // Debug log
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    toast.success('Logged out successfully', {
      style: {
        background: '#10B981',
        color: '#FFFFFF',
      },
    });
    router.replace('/'); // Redirect to homepage instead of login
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="mx-auto lg:mx-[0] px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <img src="./header-logo.png" alt="Saartheiv Logo" className="h-36 lg:h-48 w-36 lg:w-48" />
          </a>

          {/* Right Side: Hamburger Menu for Mobile */}
          <div className="flex items-center space-x-3 md:space-x-8">
            {/* Hamburger Menu for Mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-700 hover:text-teal-600 transition-colors"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Right side - Navigation and Buttons (Desktop) */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Navigation */}
              <nav className="flex items-center space-x-8">
                   <div className="relative group">
                 
                  <a
                    href="/"
                    className="flex items-center space-x-1 text-gray-700 hover:text-teal-600 transition-colors font-medium"
                  >
                    <span>{t('home')}</span>
                  </a>
                </div>
                {/* <div className="relative group">
                 
                  <a
                    href="/our-services"
                    className="flex items-center space-x-1 text-gray-700 hover:text-teal-600 transition-colors font-medium"
                  >
                    <span>{t('services')}</span>
                  </a>
                </div> */}
                <a href="/faq" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">
                  {t('faq')}
                </a>

                {user && <a href="/my-trips" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">
                  {t('myTrips')}
                </a>}
              </nav>

              {/* Language Selector */}
              <div className="flex items-center">
                <div className="relative group">
                  <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="appearance-none bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                    >
                      {cityConfig.availableLanguages.map(lang => (
                        <option key={lang} value={lang}>
                          {cityConfig.languageDisplayNames[lang]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* City Selector */}
              <div className="flex items-center">
                <div className="relative group">
                  <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <select
                      value={selectedCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="appearance-none bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                    >
                      {cityConfig.availableCities.map(city => (
                        <option key={city} value={city}>
                          {cityConfig.cityDisplayNames[city as keyof typeof cityConfig.cityDisplayNames]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {!user ? (
                  <a
                    href="/login"
                    className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-full hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    {t('login')}
                  </a>
                ) : (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      className="flex items-center space-x-2 border border-gray-300 px-4 py-2.5 rounded-full hover:border-gray-400 transition-colors font-medium text-sm focus:outline-none"
                      onClick={() => setDropdownOpen((open) => !open)}
                    >
                      <User className="w-5 h-5" />
                    <span>{user.name || ""}</span>
                    {dropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                    {dropdownOpen && (
                      <>
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <div className="px-4 py-3 text-gray-700 font-medium border-b">{user.name || ""}</div>
                          <button
                            onClick={() => setShowProfile(true)}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium border-b"
                          >
                            {t('profile')}
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 font-medium"
                          >
                            {t('logout')}
                          </button>
                        </div>

                       
                      </>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Sliding Overlay Menu for Mobile */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-16 px-4">
          {/* Language Selector for Mobile */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4" />
              <span>{t('language')} / भाषा</span>
            </label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {cityConfig.availableLanguages.map(lang => (
                <option key={lang} value={lang}>
                  {cityConfig.languageDisplayNames[lang]}
                </option>
              ))}
            </select>
          </div>

          {/* City Selector for Mobile */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              <span>{t('selectCity')}</span>
            </label>
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {cityConfig.availableCities.map(city => (
                <option key={city} value={city}>
                  {cityConfig.cityDisplayNames[city as keyof typeof cityConfig.cityDisplayNames]}
                </option>
              ))}
            </select>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex flex-col space-y-4">
            <div className="relative group">
              {!user ? (
                <a
                  href="/login"
                  className="flex items-center space-x-1 text-gray-700 hover:text-teal-600 transition-colors font-medium mb-4"
                >
                  {t('login')}
                </a>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center space-x-1 text-gray-700 hover:text-teal-600 transition-colors font-medium mb-4"
                    onClick={() => setDropdownOpen((open) => !open)}
                  >
                    <User className="w-5 h-5" />
                    <span>{user.name}</span>
                    {dropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div className="px-4 py-3 text-gray-700 font-medium border-b">{user.name}</div>
                        <button
                            onClick={() => {setDropdownOpen(false); setShowProfile(true)}}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium border-b"
                          >
                            {t('profile')}
                          </button><button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 font-medium"
                      >
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              )}
               <a
                href="/"
                className="mb-4 flex items-center space-x-1 text-gray-700 hover:text-teal-600 transition-colors font-medium"
              >
                <span>{t('home')}</span>
              </a>
              <a
                href="/our-services"
                className="flex items-center space-x-1 text-gray-700 hover:text-teal-600 transition-colors font-medium"
              >
                <span>{t('services')}</span>
              </a>
            </div>
            <a href="#" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">
              {t('faq')}
            </a>
           {user && <a href="/my-trips" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">
              {t('myTrips')}
            </a>}
          </nav>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col space-y-3">
            {/* Book a Ride functionality moved to main navigation */}
          </div>
        </div>
      </div>

      {/* Overlay Background */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

       {showProfile && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-auto relative">
                              <button
                                onClick={() => setShowProfile(false)}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                                aria-label="Close profile popup"
                              >
                                ✕
                              </button>
                              <div className="flex flex-col items-center space-y-4">
                                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                                  <User className="w-12 h-12 text-gray-500" />
                                </div>
                                <ProfileInfo user={user} />
                              </div>
                            </div>
                          </div>
                        )}
    </header>
  );
};

export default Header;
