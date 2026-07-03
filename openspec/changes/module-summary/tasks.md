## 1. Engine: ruler + warning helpers (`lib/calculations.ts`)

- [ ] 1.1 Add the ruler factor list `[0.25, 0.5, 1, 1.5, 2, 3, 4]` aligned to `CALC_LABELS`
  (single source of truth, same order).
- [ ] 1.2 Add `computeModuleRuler(m)` returning `{ label, k, size }[]` with `size = round(m·k)`
  and `label` from `CALC_LABELS` (`FR-MODULE-04`).
- [ ] 1.3 Add `moduleWarning(m)` returning `'large' | 'small' | null` against `MODULE_WARNING`
  (`>1000` large, `<100` small, else null) (`FR-MODULE-05`).
- [ ] 1.4 Keep both pure — no framework imports.

## 2. i18n

- [ ] 2.1 Add the seven ruler "typical use" keys (`useQuarterM`, `useHalfM`, `useM`, `useM15`,
  `useM2`, `useM3`, `useM4`) to `locales/en.json` and `locales/ua.json`, ported from the frozen
  prototype export; key-parity preserved.

## 3. UI: Module Summary card (`components/ModuleSummary.tsx`, `'use client'`)

- [ ] 3.1 Two-pane card: left pane hero `M = {module}` (mono, `mm` unit, `active module` label);
  read-only — takes `module`/`ceiling`/`opening` props, never a setter (`FR-MODULE-02`).
- [ ] 3.2 Right pane traceability hint: `GCD({ceiling}, {opening}) = {rawGcd} → snapped to
  {suggested}`, a `residual {n} mm` chip, and `alternatives` chips — all from
  `suggestModule(ceiling, opening)` (`FR-MODULE-03`).
- [ ] 3.3 Warning banner (`role="alert"`, `--warn-bg`) rendered only when `moduleWarning(module)`
  is non-null (`warnLarge`/`warnSmall`) (`FR-MODULE-05`).
- [ ] 3.4 Module ruler `<table>` (`Label | Size | Typical use`); label cells mono-accent from
  `CALC_LABELS`, never translated; use prose localized via the `use*` keys (`FR-MODULE-04`).

## 4. Shell integration (`components/Shell.tsx`)

- [ ] 4.1 Render `<ModuleSummary>` as the first result section inside the `showResults`-gated
  results region (replacing the `perRoom` placeholder); empty-state + `aria-live` unchanged.

## 5. Tests & verification

- [ ] 5.1 Add `lib/calculations.test.ts` cases: `computeModuleRuler` sizes at M=700
  `[175,350,700,1050,1400,2100,2800]` and a fractional module (150 → ¼M = 38); labels equal
  `CALC_LABELS`; `moduleWarning` at 700→null, 1001→'large', 99→'small', and boundaries
  1000→null / 100→null.
- [ ] 5.2 Run `node --test lib/*.test.ts`, `npm run lint`, `npm run build` (tsc) — all green.
