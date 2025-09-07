// Configuration for available cities and languages
export const cityConfig = {
  // Available cities
  availableCities: ['bihar'],
  
  // Available languages
  availableLanguages: ['hi', 'en'] as const,
  
  // City to language mapping
  cityLanguageMapping: {
    'bihar': 'hi' as const,
  },
  
  // Default language
  defaultLanguage: 'hi' as const,
  
  // City display names
  cityDisplayNames: {
    'bihar': 'Bihar',
  },
  
  // Language display names
  languageDisplayNames: {
    'hi': 'हिंदी',
    'en': 'English',
  }
};

export type AvailableCity = typeof cityConfig.availableCities[number];
export type AvailableLanguage = typeof cityConfig.availableLanguages[number];
