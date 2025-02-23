import en from "./en.json";
import de from "./de.json";

interface TranslationResources {
  [key: string]: {
    translation: {
      search: {
        result_count: string;
      };
      common: {
        title: string;
      };
    };
  };
}

const resources: TranslationResources = {
  en: {
    translation: en,
  },
  de: {
    translation: de,
  },
};

const i18n = {
  lng: "de", // default language
  resources,
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
};

export default i18n;
