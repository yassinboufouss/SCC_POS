import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { en } from './i18n/translations/en';
import { fr } from './i18n/translations/fr';
import { ar } from './i18n/translations/ar';

// Initial translations (only core strings for now)
const resources = {
  en: en,
  fr: fr,
  ar: ar,
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
        order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
        caches: ['localStorage'],
    }
  });

export default i18n;