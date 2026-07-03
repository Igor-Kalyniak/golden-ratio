## Why

The product is bilingual UA/EN by definition (`TC-I18N-01`): an architect productive in one
language must be equally productive in the other. Before any user-facing string is written, the
app needs a lightweight translation layer — a React context holding the active locale and a
`t(key)` lookup, two flat JSON dictionaries, and a live language toggle — so every later UI
capability renders through `t()` from day one instead of hardcoding English. This is capability 3
in [docs/CAPABILITIES.md](../../../docs/CAPABILITIES.md), dependency-free (parallel with the
shipped engine and design-system). Owns `FR-I18N-01/02/03`, `TC-I18N-01`.

## What Changes

- **`locales/en.json` + `locales/ua.json`** — two flat dictionaries (`Record<string,string>`),
  ported **verbatim** from the frozen export `STR` object (`docs/design/export/prototype.dc.html`
  ~L392–459) / DESIGN §11. Same key set in both files (`FR-I18N-02`).
- **`lib/i18n.ts` (pure, framework-free)** — `Locale = 'en' | 'ua'`, `Dictionary` type,
  `LOCALES`, the never-translate calculation labels (`CALC_LABELS` = ¼M…4M, `FR-I18N-03`),
  `createTranslator(dict) → t(key)` (returns the string, falling back to the key), and
  `missingKeys(base, other)` for dictionary-parity checks. No `react`/`next`/DOM imports so it is
  unit-testable.
- **`lib/i18n-context.tsx` (`'use client'`)** — `LanguageProvider` holding `locale` state
  (default `'en'`) + `setLocale`, and `useI18n()` returning `{ locale, setLocale, t }` built over
  `createTranslator` and the imported dictionaries; switching locale re-renders live
  (`FR-I18N-01`).
- **`components/LanguageToggle.tsx` (`'use client'`)** — an `EN | UA` pill that calls `setLocale`;
  switches all strings live with no reload. (Its top-right placement is `FR-SHELL-03`, owned by
  `app-shell`.)
- **`lib/i18n.test.ts`** — node:test suite: EN/UA key parity (no missing/extra keys), the
  `createTranslator` lookup + key fallback, and the never-translate rule (calc labels are not
  dictionary keys and pass through unchanged).

Plumbing only — no page wires this in yet (`app-shell` (4) mounts the provider and places the
toggle). Calculation labels (¼M, ½M, M, …) are never translated (`FR-I18N-03`).

## Capabilities

### New Capabilities
- `i18n`: bilingual UA/EN plumbing — the `LanguageContext`/`t(key)` translation layer, the flat
  EN/UA JSON dictionaries, the live `LanguageToggle`, and the never-translate rule for calculation
  labels; no heavy i18n library.

### Modified Capabilities
<!-- none — no existing spec's requirements change -->

## Impact

- **New files:** `locales/en.json`, `locales/ua.json`, `lib/i18n.ts`, `lib/i18n-context.tsx`,
  `components/LanguageToggle.tsx`, `lib/i18n.test.ts`. No new dependencies (React context + JSON
  only — `TC-I18N-01`).
- **Requirements owned:** `FR-I18N-01`, `FR-I18N-02`, `FR-I18N-03`, `TC-I18N-01`.
- **Enables:** every UI capability renders strings through `t()`; `app-shell` (4) mounts the
  provider and positions the toggle (`FR-SHELL-03`).
- **No impact on:** `lib/calculations.ts`, `app/globals.css` (design-system), routing, server.
