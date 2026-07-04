'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import en from '../locales/en.json';
import ua from '../locales/ua.json';
import { createTranslator, DEFAULT_LOCALE, type Locale } from './i18n';

/** The valid translation keys, derived from the EN dictionary (UA has the same key set). */
export type TranslationKey = keyof typeof en;

const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = { en, ua };

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Translate a key in the active locale; falls back to the key when missing. */
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Holds the active locale (default `en`, in-memory only — BC-PRIVACY-01) and provides a
 * memoized `t()`. Changing the locale re-renders every consumer live (FR-I18N-01).
 */
export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  // Keep the document's language in sync with the active locale so assistive tech announces the
  // page in the right language (the static `lang` in app/layout.tsx only covers the initial paint).
  // BCP-47: our `ua` locale id maps to the `uk` language tag.
  useEffect(() => {
    document.documentElement.lang = locale === 'ua' ? 'uk' : 'en';
  }, [locale]);

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t: createTranslator(DICTIONARIES[locale]) }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Access the active locale, `setLocale`, and `t()`. Throws if used outside the provider. */
export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (ctx === null) {
    throw new Error('useI18n must be used within a <LanguageProvider>');
  }
  return ctx;
}
