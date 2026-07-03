## 1. Pure state extension (FR-APT-03)

- [x] 1.1 Add `moduleTouched: boolean` to `AppState`; default `false` in `DEFAULT_STATE`
- [x] 1.2 Implement `withCeiling(state, ceiling)`: updates ceiling; re-suggests module via `suggestModule` only when `!moduleTouched`
- [x] 1.3 Implement `withOpening(state, opening)`: same auto-follow rule for opening
- [x] 1.4 Implement `withModule(state, module)`: sets module, marks `moduleTouched = true`
- [x] 1.5 Extend `lib/app-state.test.ts`: untouched follows suggestion on ceiling/opening change; touched is sticky; `withModule` marks touched; default state has `moduleTouched: false` and `module === suggestModule(2800,2100).suggested`

## 2. Wire state owner (TC-ARCH-01, FR-APT-05)

- [x] 2.1 In `components/Calculator.tsx`, add `onCeilingChange`/`onOpeningChange`/`onModuleChange` via the new reducers over `setState`
- [x] 2.2 Pass `state` + the three handlers down to `Shell` (no submit button; synchronous)

## 3. Apartment form (FR-APT-01/02/03/04, DESIGN §5.2/§5.4)

- [x] 3.1 Create `components/ApartmentForm.tsx` (`'use client'`): ceiling field — label + right-aligned `rngCeiling` hint, `mm` suffix, mono value, inline error on `!isValidCeiling`
- [x] 3.2 Opening field — label + `rngOpening` hint, `mm` suffix, inline error on `!isValidOpening(opening, ceiling)`
- [x] 3.3 Module `<select>` over `STANDARD_MODULES`; suggested option labelled `"{value} — suggested"` (`t('suggested')`); `override` tag (`t('overridable')`) next to the label
- [x] 3.4 Each invalid field: `--err` border, `role="alert"` message (`errCeiling`/`errOpening`), `aria-invalid`, `aria-describedby` linking the message id

## 4. Wire into the shell slot

- [x] 4.1 In `components/Shell.tsx`, replace the apartment dashed placeholder with `<ApartmentForm>` fed the new props; leave the rooms placeholder untouched

## 5. Verify

- [x] 5.1 `npm test` green (engine + i18n + app-state, incl. new reducer tests)
- [x] 5.2 `npm run build` succeeds
- [x] 5.3 `npm run lint` clean for changed files
- [x] 5.4 `npx tsc --noEmit` type-checks under strict mode
- [x] 5.5 Manual: default shows ceiling 2800 / opening 2100 / module "700 — suggested"; editing ceiling re-suggests module until a module is picked directly, then stays fixed on further height edits; invalid ceiling/opening show inline errors with visible focus
