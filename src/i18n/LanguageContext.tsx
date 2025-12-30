import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, LANGUAGE_NAMES } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: typeof LANGUAGE_NAMES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'buddybe_language';

function detectBrowserLanguage(): Language {
  const browserLang = navigator.language.toLowerCase().split('-')[0];
  
  const langMap: Record<string, Language> = {
    'en': 'en',
    'fr': 'fr',
    'es': 'es',
    'ru': 'ru',
    'pt': 'pt',
    'uk': 'uk',
    'ko': 'ko',
    'zh': 'zh',
  };
  
  return langMap[browserLang] || 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in translations) {
      return saved as Language;
    }
    return detectBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGE_NAMES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
