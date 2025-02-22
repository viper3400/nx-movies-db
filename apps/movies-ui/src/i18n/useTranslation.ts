import { useState, useEffect } from "react";
import i18n from "./i18n";
import { TranslationKeys } from "./TranslationKeys";

const useTranslation = () => {
  const [t, setT] = useState<TranslationKeys>({});
  const [lang, setLang] = useState(i18n.lng);

  useEffect(() => {
    setT(i18n.resources[i18n.lng].translation);
  }, []);

  const changeLanguage = (newLang: string) => {
    i18n.lng = newLang;
    setLang(newLang);
  };

  return { t, lang, changeLanguage };
};

export default useTranslation;
