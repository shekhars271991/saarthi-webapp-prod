'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../translations';
import { cityConfig, AvailableLanguage } from '../config/cities';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  setLanguageByCity: (city: string, force?: boolean) => void;
  reloadLanguage: () => void;
  t: (key: keyof typeof translations.hi) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Always start with default language to avoid hydration mismatch
  const [language, setLanguageState] = useState<Language>(cityConfig.defaultLanguage);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side and load saved language
    setIsClient(true);
    loadLanguage();
  }, []);

  const loadLanguage = () => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && cityConfig.availableLanguages.includes(savedLanguage as AvailableLanguage)) {
        setLanguageState(savedLanguage);
        return;
      }
    }
    // If no saved language, use default
    setLanguageState(cityConfig.defaultLanguage);
  };

  useEffect(() => {
    if (!isClient) return;

    // Listen for storage changes (in case language is changed in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'language' && e.newValue) {
        const newLanguage = e.newValue as Language;
        if (cityConfig.availableLanguages.includes(newLanguage as AvailableLanguage)) {
          setLanguageState(newLanguage);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isClient]);

  const setLanguage = (newLanguage: Language) => {
    if (cityConfig.availableLanguages.includes(newLanguage as AvailableLanguage)) {
      setLanguageState(newLanguage);
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', newLanguage);
      }
    }
  };

  const setLanguageByCity = (city: string, force: boolean = false) => {
    const cityLanguage = cityConfig.cityLanguageMapping[city as keyof typeof cityConfig.cityLanguageMapping];
    if (cityLanguage) {
      // Only set language if forced or no language preference exists
      if (force || (typeof window !== 'undefined' && !localStorage.getItem('language'))) {
        setLanguage(cityLanguage);
      }
    }
  };

  const reloadLanguage = () => {
    loadLanguage();
  };

  const t = (key: keyof typeof translations.hi): string => {
    return translations[language]?.[key] || translations[cityConfig.defaultLanguage][key] || key.toString();
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      setLanguageByCity,
      reloadLanguage,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
