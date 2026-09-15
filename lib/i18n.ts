/**
 * Bilingual UA/EN plumbing — pure, framework-free core (no `react`/`next`/DOM).
 *
 * The React context, provider, and hook live in `lib/i18n-context.tsx`; the toggle in
 * `components/LanguageToggle.tsx`. This module holds only what is unit-testable under
 * `node --test`: the types, the translator factory, the never-translate calculation
 * labels (FR-I18N-03), and a dictionary-parity helper (FR-I18N-02).
 *
 * Canonical strings: docs/DESIGN.md §11 / the frozen export `STR` object. TC-I18N-01.
 */

export type Locale = 'en' | 'ua';

/** All supported locales, in display order. */
export const LOCALES: readonly Locale[] = ['en', 'ua'] as const;

/** The default locale (mirrors the export `state.lang`); in-memory only (BC-PRIVACY-01). */
export const DEFAULT_LOCALE: Locale = 'en';

/** A flat dictionary — one string per key (FR-I18N-02). */
export type Dictionary = Record<string, string>;

/**
 * Calculation labels are locale-independent and NEVER translated (FR-I18N-03).
 * The UI reads these directly; they are not dictionary keys.
 */
export const CALC_LABELS = ['¼M', '½M', 'M', '1.5M', '2M', '3M', '4M'] as const;
export type CalcLabel = (typeof CALC_LABELS)[number];

/**
 * Build a `t(key)` translator over one dictionary. A missing key falls back to the key
 * itself (never `undefined`) so a gap is visible in the UI rather than blank.
 *
 * Generic over the key type: passing a concrete dictionary (e.g. `en`) narrows `K` to that
 * dictionary's keys, giving call sites compile-time key checking; it defaults to `string`.
 */
export function createTranslator<K extends string = string>(
  dict: Record<K, string>,
): (key: K) => string {
  return (key: K): string => dict[key] ?? (key as string);
}

/** Keys present in `base` but missing from `other` — for dictionary-parity checks. */
export function missingKeys(base: Dictionary, other: Dictionary): string[] {
  return Object.keys(base).filter((k) => !(k in other));
}
