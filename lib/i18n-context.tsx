'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import en from '../locales/en.json';
import ua from '../locales/ua.json';
import {
  createTranslator,
  DEFAULT_LOCALE,
  type Dictionary,
  type Locale,
} from './i18n';

const DICTIONARIES: Record<Locale, Dictionary> = { en, ua };

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Translate a key in the active locale; falls back to the key when missing. */
  t: (key: string) => string;
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
