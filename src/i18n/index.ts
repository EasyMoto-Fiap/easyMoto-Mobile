import * as Localization from 'expo-localization';
import { I18n, type TranslateOptions } from 'i18n-js';
import pt from './pt.json';
import es from './es.json';

export const i18n = new I18n({ pt, es });
i18n.enableFallback = true;

const device = (Localization.getLocales?.() ?? [])[0]?.languageCode ?? 'pt';
i18n.locale = device.startsWith('es') ? 'es' : 'pt';

export type Lang = 'pt' | 'es';
export function setLocale(lang: Lang) {
  i18n.locale = lang;
}
export const t = (key: string, options?: TranslateOptions) => i18n.t(key, options);
export default i18n;
