import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';

export function setupI18n(language: 'en' | 'hi' = 'en') {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      compatibilityJSON: 'v4',
      resources: {
        en: { translation: en },
        hi: { translation: hi },
      },
      lng: language,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
  } else if (i18n.language !== language) {
    i18n.changeLanguage(language);
  }
}

export default i18n;
