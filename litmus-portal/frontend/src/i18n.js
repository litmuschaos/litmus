import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import yaml from 'js-yaml';
import { initReactI18next } from 'react-i18next';

i18n
  // load translation using http -> see /public/locales
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    lng: 'en',
    fallbackLng: {
      'en-US': ['en'],
      'en-GB': ['en'],
      'en-UK': ['en'],
      default: ['en'],
    },
    debug: true,
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: `${process.env.PUBLIC_URL}/locales/{{lng}}/{{ns}}.yaml`,
      parse(data) {
        return yaml.load(data);
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
