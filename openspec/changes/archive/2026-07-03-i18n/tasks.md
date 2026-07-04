## 1. Dictionaries (FR-I18N-02)

- [x] 1.1 Create `locales/en.json` — flat `Record<string,string>`, ported verbatim from the export `STR.en` (drop the nested `gridQual`; keep flat `qexact/qclose/qpoor`)
- [x] 1.2 Create `locales/ua.json` — the matching `STR.ua`, identical key set
- [x] 1.3 Sanity-check both parse and have the same keys

## 2. Pure i18n module (FR-I18N-03, TC-I18N-01)

- [x] 2.1 Create `lib/i18n.ts` (no `react`/`next`/DOM): export `Locale`, `Dictionary`, `LOCALES`
- [x] 2.2 Export `CALC_LABELS = ['¼M','½M','M','1.5M','2M','3M','4M']` (never-translate, FR-I18N-03)
- [x] 2.3 Implement `createTranslator(dict): (key) => string` with key fallback (never `undefined`)
- [x] 2.4 Implement `missingKeys(base, other): string[]` for parity checks

## 3. React context + hook (FR-I18N-01, TC-I18N-01)

- [x] 3.1 Create `lib/i18n-context.tsx` (`'use client'`): import both JSON dicts, map by locale
- [x] 3.2 `LanguageProvider` holds `locale` state (default `'en'`) + `setLocale`; memoizes `t`
- [x] 3.3 `useI18n()` returns `{ locale, setLocale, t }`; throws if used outside the provider

## 4. Language toggle (FR-I18N-01)

- [x] 4.1 Create `components/LanguageToggle.tsx` (`'use client'`): `EN | UA` pill using `useI18n`
- [x] 4.2 Indicate the active locale (aria-pressed / visible state); keyboard-operable
- [x] 4.3 Activating the inactive language calls `setLocale` → live re-render

## 5. Unit suite (parity + translator + never-translate)

- [x] 5.1 Create `lib/i18n.test.ts` (node:test)
- [x] 5.2 Assert EN/UA key parity (both directions, via `fs` read + `missingKeys`)
- [x] 5.3 Assert `createTranslator` resolves known keys and falls back to the key on miss
- [x] 5.4 Assert `CALC_LABELS` are not present as values/keys in either dictionary (FR-I18N-03)

## 6. Verify

- [x] 6.1 `npm test` green (i18n suite + engine suite)
- [x] 6.2 `npm run build` succeeds
- [x] 6.3 `npm run lint` clean for new files
- [x] 6.4 `npx tsc --noEmit` type-checks under strict mode
