import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./locals/en/translation.json";
import translationHI from "./locals/hi/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translationEN },
    hi: { translation: translationHI },
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
