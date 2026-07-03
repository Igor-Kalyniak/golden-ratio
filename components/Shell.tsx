'use client';

import { useI18n } from '../lib/i18n-context';
import { type AppState, type Mode, type Room } from '../lib/app-state';
import { type ModuleSuggestion } from '../lib/calculations';
import { ApartmentForm } from './ApartmentForm';
import { BandDiagram } from './BandDiagram';
import { LanguageToggle } from './LanguageToggle';
import { ModeToggle } from './ModeToggle';
import { ModuleSummary } from './ModuleSummary';
import { PerRoomResults } from './PerRoomResults';
import { RoomList } from './RoomList';
import { Viz2D } from './Viz2D';
import { Viz3D } from './Viz3D';
import { ThemeToggle } from './ThemeToggle';

interface ShellProps {
  state: AppState;
  showResults: boolean;
  /** Mode-appropriate module suggestion, computed by `Calculator` (TC-ARCH-01). */
  suggestion: ModuleSuggestion;
  onModeChange: (mode: Mode) => void;
  onCeilingChange: (value: number) => void;
  onOpeningChange: (value: number) => void;
  onModuleChange: (value: number) => void;
  onAddRoom: () => void;
  onRemoveRoom: (id: string) => void;
  onRoomChange: (id: string, patch: Partial<Pick<Room, 'name' | 'length' | 'width'>>) => void;
}

/**
 * Presentational shell (DESIGN §4): sticky header + responsive two-column body. A descendant
 * of `LanguageProvider`, so it resolves every string through `t()`. The apartment slot is
 * filled by `ApartmentForm` (change 5) and the rooms slot by `RoomList` (change 6).
 * A `ModeToggle` (change 13) sits atop the input column; 2D mode hides the height fields and the
 * band diagram (FR-MODE-02). The results region opens with `ModuleSummary` (change 7);
 * bands/per-room/visualizer (changes 8–15) render below it, all gated on validity (FR-SHELL-04).
 * `state`/`showResults` flow down as props (TC-ARCH-01) from `Calculator`, the state owner.
 */
export function Shell({
  state,
  showResults,
  suggestion,
  onModeChange,
  onCeilingChange,
  onOpeningChange,
  onModuleChange,
  onAddRoom,
  onRemoveRoom,
  onRoomChange,
}: ShellProps) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-full flex-col bg-bg text-fg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-panel/90 px-5 py-3 backdrop-blur lg:h-[var(--header-h)] lg:flex-nowrap">
        {/* Logo placeholder — the golden-ratio mark is FR-LOGO-01 (change 16). */}
        <span
          aria-hidden="true"
          className="h-6 w-6 shrink-0 rounded-sm border-2 border-accent"
        />
        <div className="mr-auto min-w-0">
          <h1 className="truncate text-[15px] font-semibold leading-tight">{t('title')}</h1>
          <p className="truncate text-[11.5px] text-muted">{t('subtitle')}</p>
        </div>

        {/* "updates live" pill (FR-SHELL-01 reactivity cue). */}
        <span className="hidden items-center gap-1.5 rounded-full border border-line bg-panel2 px-2.5 py-1 text-[11.5px] text-muted sm:inline-flex">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-good [animation:livedot_1.6s_ease-in-out_infinite]"
          />
          {t('live')}
        </span>

        <ThemeToggle />
        {/* Language toggle, top-right (FR-SHELL-03). */}
        <LanguageToggle />
      </header>

      {/* Body: stacked on small screens, two columns on wide (FR-SHELL-02, NFR-RESP-01). */}
      <main className="mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 gap-6 p-5 lg:grid-cols-[minmax(320px,400px)_1fr] lg:items-start">
        {/* Input column slot — apartment fields (5, below) + room list (6) fill this. */}
        <section aria-label={t('inputs')} className="lg:sticky lg:top-[var(--header-h)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t('inputs')}</h2>
              <ModeToggle mode={state.mode} onModeChange={onModeChange} />
            </div>
            <ApartmentForm
              mode={state.mode}
              ceiling={state.ceiling}
              opening={state.opening}
              module={state.module}
              suggested={suggestion.suggested}
              onCeilingChange={onCeilingChange}
              onOpeningChange={onOpeningChange}
              onModuleChange={onModuleChange}
            />
            <RoomList
              rooms={state.rooms}
              onAddRoom={onAddRoom}
              onRemoveRoom={onRemoveRoom}
              onRoomChange={onRoomChange}
            />
          </div>
        </section>

        {/* Results region — gated on validity (FR-SHELL-04); announced politely. */}
        <section aria-label={t('results')} aria-live="polite">
          {showResults ? (
            <div className="space-y-5">
              {/* Module Summary is the first result section (change 7); bands, per-room, and
                  the visualizer (changes 8–15) follow below it. */}
              <ModuleSummary
                mode={state.mode}
                module={state.module}
                ceiling={state.ceiling}
                opening={state.opening}
                suggestion={suggestion}
              />
              {/* Band diagram is a 3D-only result (DESIGN §6.2, FR-MODE-02) — hidden in 2D. */}
              {state.mode === '3d' && (
                <BandDiagram
                  ceiling={state.ceiling}
                  module={state.module}
                  opening={state.opening}
                />
              )}
              {/* Module visualizer (read-only): 2D SVG plan (change 14) in 2D mode; the lazy 3D
                  canvas (change 15, Three.js loaded on demand) in 3D mode. */}
              {state.mode === '2d' && <Viz2D rooms={state.rooms} module={state.module} />}
              {state.mode === '3d' && (
                <Viz3D
                  rooms={state.rooms}
                  module={state.module}
                  ceiling={state.ceiling}
                  opening={state.opening}
                />
              )}
              {/* Per-room result cards (change 9); grid-fit (10) + walkway (11) add blocks. */}
              <PerRoomResults rooms={state.rooms} module={state.module} />
            </div>
          ) : (
            <div className="grid min-h-[160px] place-items-center rounded-xl border border-dashed border-line2 bg-panel2 p-6 text-center text-sm text-muted">
              {t('fillToSee')}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
