import en from './en.json';
import hi from './hi.json';
import mr from './mr.json';

export type Language = 'en' | 'hi' | 'mr';

export const dictionaries = {
  en,
  hi,
  mr,
};

/**
 * Get translated string by dot notation path (e.g. 'home.greeting')
 * with fallback to English and parameter interpolation (e.g. { current: 1, total: 5 }).
 */
export function getTranslation(lang: Language, keyPath: string, params?: Record<string, string | number>): string {
  const currentDict = dictionaries[lang] || dictionaries.en;
  const fallbackDict = dictionaries.en;

  const resolvePath = (obj: any, path: string): string | undefined => {
    const keys = path.split('.');
    let cur = obj;
    for (const k of keys) {
      if (cur && typeof cur === 'object' && k in cur) {
        cur = cur[k];
      } else {
        return undefined;
      }
    }
    return typeof cur === 'string' ? cur : undefined;
  };

  let text = resolvePath(currentDict, keyPath);
  if (!text) {
    text = resolvePath(fallbackDict, keyPath) || keyPath;
  }

  if (params) {
    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
    }
  }

  return text;
}
