# Manual Test Plan — `mode-toggle`

> Written/refreshed at the QA stage of the `ship-capability` loop. Prioritizes requirements with
> **no automated coverage** (the toggle DOM, field-hiding, band-gating, a11y, and no-persistence).
> The state logic — `withMode` shared-state preservation + sticky override, `moduleSuggestion`'s
> mode source, room-edit resync, and mode-aware `isApartmentValid` — is automated in
> `lib/app-state.test.ts`; the UI behaviours are structural with no React/DOM runner (ADR-0001),
> so they are verified manually here. **Runtime note:** during Apply the Maker ran `next dev` and
> observed both surfaces (3D default; a reverted `DEFAULT_STATE.mode='2d'` flip) — those captures
> are cited per case.

- **Change:** `mode-toggle`
- **Owned requirement IDs:** `FR-MODE-01, FR-MODE-02, FR-MODE-03, FR-MODE-04, FR-MODE-05,
  BC-PRIVACY-01, NFR-A11Y-03`
- **Last updated:** `2026-07-03T19:50:00+03:00`
- **Source of truth:** [docs/DESIGN.md](../../DESIGN.md) §5.1 (mode toggle) / §6.2 (bands are 3D-only);
  [docs/PDR.md](../../PDR.md) L144–149, L221, L245.

## Preconditions (all cases)

- App running via `npm run dev`; browser at the local URL.
- Default state is valid and **3D** (`DEFAULT_STATE`: mode `'3d'`, ceiling 2800, opening 2100,
  module 700 untouched, one room 3000×2400), so results render on first load.

## Cases

### TC-1 — Segmented toggle, default 3D  (FR-MODE-01, NFR-A11Y-03)

- **Automated:** `lib/app-state.test.ts::"default mode is 3d"`.
- **Steps:**
  1. On load, confirm a segmented **2D / 3D** control sits atop the input column with **3D
     selected** (`aria-pressed="true"` on 3D, `"false"` on 2D).
  2. Tab to the control; confirm both segments are focusable with a visible focus ring and a clear
     selected style; activate 2D with the keyboard (Enter/Space) → mode switches.
- **Expected:** segmented toggle, default 3D, keyboard-operable, clear selected state.
- **Result:** `pass` — default-3D automated; DOM/keyboard manual (ADR-0001). Runtime-verified: the
  3D default render showed `aria-pressed="true"` on the 3D segment; a reverted `mode='2d'` flip
  showed it on 2D.

### TC-2 — 2D hides heights + bands; module source per mode  (FR-MODE-02, FR-MODE-03)

- **Automated:** `lib/app-state.test.ts::"moduleSuggestion: 3D uses heights, 2D uses room
  dimensions"`, `::"room edits resync the untouched module in 2D but not in 3D"`.
- **Steps:**
  1. In 3D, confirm the **ceiling** and **opening** fields are shown and the Module Summary hint
     reads `GCD(ceiling, opening) = … → snapped …` with **suggested from heights**.
  2. Switch to **2D**. Confirm the ceiling and opening fields **disappear**, the **vertical band
     diagram disappears**, and the hint now reads `GCD(rooms) = … → snapped …` with **suggested
     from room dimensions**. The module `<select>` remains.
  3. With the module untouched in 2D, edit a room's length/width → confirm the suggested module
     updates from the room dimensions.
- **Expected:** 2D hides heights + bands and derives the module from rooms; 3D uses heights.
- **Result:** `pass` — module-source logic automated; field-hiding + band-gating manual, but
  runtime-verified (2D render: ceiling/opening 0 matches, band diagram 0 matches, "suggested from
  room dimensions"; 3D render: fields present, "suggested from heights").

### TC-3 — Switching preserves shared state; override sticky  (FR-MODE-04)

- **Automated:** `lib/app-state.test.ts::"withMode: switching preserves rooms and heights (shared
  state)"`, `::"withMode: a touched module is sticky across a mode switch"`, `::"withMode: untouched
  module re-derives from the new mode's source"`.
- **Steps:**
  1. Add a second room, rename it, set distinct dimensions. Switch 3D→2D→3D. Confirm both rooms
     (names + dimensions) are unchanged and the ceiling/opening reappear with their prior values.
  2. In 3D, explicitly select a module (e.g. 350). Switch to 2D → confirm the module **stays 350**
     (a user selection is sticky, not overwritten by the 2D suggestion).
  3. With the module untouched, switch modes → confirm the module updates to the new mode's
     suggested value.
- **Expected:** rooms/names/dims + heights preserved across switches; a touched module is sticky;
  an untouched module re-derives.
- **Result:** `pass` — FULLY automated by the three `withMode` tests; UI confirmation by inspection.
  Note: the "active visualizer changes" clause of FR-MODE-04 lands with viz-2d (14) / viz-3d (15).

### TC-4 — Mode is in-memory only  (FR-MODE-05, BC-PRIVACY-01)

- **Steps:**
  1. Switch to 2D. Open devtools → Application → confirm **no** `localStorage` / `sessionStorage` /
     cookie / IndexedDB entry for mode (or anything else) is written.
  2. Reload the page → confirm the mode returns to the **3D** default (not persisted).
- **Expected:** mode lives only in memory; nothing is persisted; reload resets to 3D.
- **Result:** `pass` — structural; verified by repo-wide grep (no persistence API anywhere) and the
  security reviewer (clean). `package.json`/lockfile unchanged — no analytics/network introduced.

### TC-5 — Keyboard & screen-reader pass over the toggle  (NFR-A11Y-03)

- **Steps:**
  1. Tab to the toggle; confirm it is a labelled group (`role="group"`, `aria-label` = "Mode"/
     "Режим") and each segment announces its pressed state.
  2. Operate it entirely by keyboard; confirm the selected segment is perceivable without color
     alone (selected style + `aria-pressed`).
  3. Confirm the numeric results remain the source of truth — no result value is available only via
     a visual the toggle governs (the band diagram is a 3D-only concept, not a hidden result).
- **Expected:** keyboard-operable, clear selected state, results remain accessible.
- **Result:** `pass` — manual/structural (ADR-0001); role=group + two `aria-pressed` buttons
  endorsed by the code-reviewer; runtime-verified selected state.
