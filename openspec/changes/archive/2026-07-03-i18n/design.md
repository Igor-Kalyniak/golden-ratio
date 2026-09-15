# i18n design

## Context

Capability 3 in [docs/CAPABILITIES.md](../../../../docs/CAPABILITIES.md), dependency-free. The
canonical strings are frozen in the export `STR` object (`docs/design/export/prototype.dc.html`
~L392–459) and summarized in DESIGN §11 / the `i18n-strings` skill. `TC-I18N-01` mandates a React
context + JSON dictionaries with **no heavy i18n library**. The engine (1) and design-system (2)
are shipped; this adds the string layer every later UI capability consumes.

## Goals / Non-Goals

**Goals:**
- Port the EN/UA dictionaries verbatim into two flat JSON files with an identical key set.
- Provide a minimal context (`locale` + `setLocale` + `t`) and a live `LanguageToggle`.
- Keep calculation labels (¼M…4M) out of translation entirely (`FR-I18N-03`).
- Unit-test the pure parts (parity, translator, never-translate) with the existing `node:test`.

**Non-Goals:**
- No page wiring / provider mounting / toggle placement (that is `app-shell` (4) + `FR-SHELL-03`).
- No locale persistence (BC-PRIVACY-01 — in-memory only; default `'en'`).
- No pluralization/ICU/interpolation engine — flat string lookup is sufficient for this UI.

## Decisions

- **Split pure logic from the React layer.** `lib/i18n.ts` is framework-free (types,
  `createTranslator`, `CALC_LABELS`, `missingKeys`) so it is unit-testable under `node --test`
  (which cannot execute JSX). `lib/i18n-context.tsx` (`'use client'`) holds the React context,
  `LanguageProvider`, and `useI18n`; `components/LanguageToggle.tsx` (`'use client'`) is the UI.
  Alt considered: one `.tsx` module — rejected because JSX can't be tested by the native runner.
- **JSON imported in the client module, not the pure one.** The `.tsx` context imports
  `locales/*.json` (Next resolves via `resolveJsonModule`); the pure `lib/i18n.ts` takes a
  `Dictionary` as a parameter (dependency injection). This keeps the `node:test` suite free of the
  ESM JSON-import-attribute requirement — the test reads the JSON via `fs` for parity and passes
  inline dicts to `createTranslator`.
- **`t(key)` falls back to the key**, never `undefined`, so a missing string is visible in the UI
  rather than blank — matching the app's "surface problems honestly" principle.
- **Default locale `'en'`**, mirroring the export `state.lang='en'`; in-memory only (no persistence).
- **Flat dictionaries.** The export's one nested object (`gridQual`) is dropped in favor of the
  already-present flat `qexact/qclose/qpoor` keys, so both files are pure `Record<string,string>`
  (`FR-I18N-02`).

## Risks / Trade-offs

- **Dictionary drift (a key added to one file only)** → Mitigated by the `missingKeys` helper and a
  `node:test` parity test that fails if the key sets differ.
- **Translation fidelity of the UA strings** → Ported verbatim from the frozen canonical export; a
  real linguistic review is a separate PM/translator task (PDR dependency "UA + EN translations"),
  out of scope for this plumbing change.
- **React context/toggle have no automated test** (no React/DOM runner — see ADR-0001 "Revisit
  when") → Verified by build + lint + type-check + the pure suite; documented in the test plan.
- **`t` returning the key on miss could mask a typo** → Acceptable and intentional (visible
  fallback); the parity test catches whole-key omissions.

## Migration Plan

Additive: new `locales/`, `lib/i18n.ts`, `lib/i18n-context.tsx`, `components/LanguageToggle.tsx`,
`lib/i18n.test.ts`. No dependency, no existing-file edits, no routing. Reversible by deletion.
Nothing renders it yet, so no user-facing change until `app-shell` mounts the provider.

## Open Questions

- Whether the default locale should be `'ua'` for the target UA market — deferred; export defaults
  to `'en'` and a toggle flips it live. Cheap to change (one constant).
- Whether to persist the chosen locale — deferred and currently **no** (BC-PRIVACY-01, in-memory).
