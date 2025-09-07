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
  const [language, setLanguageState] = useState<Language>(() => {
    // Initialize with saved language or default
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && cityConfig.availableLanguages.includes(savedLanguage as AvailableLanguage)) {
        return savedLanguage;
      }
    }
    return cityConfig.defaultLanguage;
  });

  useEffect(() => {
    // Listen for storage changes (in case language is changed in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'language' && e.newValue) {
        const newLanguage = e.newValue as Language;
        if (cityConfig.availableLanguages.includes(newLanguage as AvailableLanguage)) {
          setLanguageState(newLanguage);
        }
      }
    };

    // Load language preference from localStorage on mount and navigation
    const loadLanguage = () => {
      if (typeof window !== 'undefined') {
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && cityConfig.availableLanguages.includes(savedLanguage as AvailableLanguage)) {
          setLanguageState(savedLanguage);
        }
      }
    };

    // Load language immediately
    loadLanguage();

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for focus events (when user returns to tab)
    window.addEventListener('focus', loadLanguage);
    
    // Listen for custom language change events
    const handleLanguageChange = (e: CustomEvent) => {
      const newLanguage = e.detail as Language;
      if (cityConfig.availableLanguages.includes(newLanguage as AvailableLanguage)) {
        setLanguageState(newLanguage);
      }
    };
    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    // Listen for page visibility changes (when user navigates back to the page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadLanguage();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadLanguage);
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Dispatch a custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    }
  };

  const setLanguageByCity = (city: string, force: boolean = false) => {
    // Only override language if forced or if no language preference exists
    if (force || !localStorage.getItem('language')) {
      if (cityConfig.cityLanguageMapping[city as keyof typeof cityConfig.cityLanguageMapping]) {
        const cityLanguage = cityConfig.cityLanguageMapping[city as keyof typeof cityConfig.cityLanguageMapping];
        setLanguageState(cityLanguage);
        localStorage.setItem('language', cityLanguage);
      }
    }
  };

  const reloadLanguage = () => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && cityConfig.availableLanguages.includes(savedLanguage as AvailableLanguage)) {
        setLanguageState(savedLanguage);
      }
    }
  };

  const t = (key: keyof typeof translations.hi): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    setLanguageByCity,
    reloadLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
