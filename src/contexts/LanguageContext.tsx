import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import i18n, { setLocale, type Lang } from '../i18n';

type LanguageContextType = {
    lang: Lang;
    setLang: (l: Lang) => void;
    toggleLang: () => void;
};

export const LanguageContext = createContext<LanguageContextType>({
    lang: 'pt',
    setLang: () => {},
    toggleLang: () => {}
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(i18n.locale.startsWith('es') ? 'es' : 'pt');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('lang');
        if (saved === 'pt' || saved === 'es') {
          setLangState(saved);
          setLocale(saved);
        }
      } catch {}
    })();
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setLocale(l);
    AsyncStorage.setItem('lang', l).catch(() => {});
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'pt' ? 'es' : 'pt');
  }, [lang, setLang]);

  const value = useMemo(() => ({ lang, setLang, toggleLang }), [lang, setLang, toggleLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}