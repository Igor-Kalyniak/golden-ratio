'use client';

import { useI18n } from '../lib/i18n-context';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';

/**
 * Presentational shell (DESIGN §4): sticky header + responsive two-column body. A descendant
 * of `LanguageProvider`, so it resolves every string through `t()`. The input column and
 * results region are slots that later capabilities fill (apartment 5, rooms 6, results 7–11);
 * this component owns their arrangement and the validity gate (FR-SHELL-04). `showResults` is
 * the derived result flowing down as a prop (TC-ARCH-01); the editable state + setter arrive
 * with the input capabilities (5/6).
 */
export function Shell({ showResults }: { showResults: boolean }) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-full flex-col bg-bg text-fg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-panel/90 px-5 py-3 backdrop-blur">
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
        {/* Input column slot — apartment fields (5) + room list (6) fill this. */}
        <section aria-label={t('inputs')} className="lg:sticky lg:top-[67px]">
          <div className="rounded-xl border border-line bg-panel p-4">
            <h2 className="mb-3 text-sm font-semibold">{t('inputs')}</h2>
            <div className="space-y-3 text-sm text-muted">
              <div className="rounded-lg border border-dashed border-line2 p-3">
                {t('apartment')}
              </div>
              <div className="rounded-lg border border-dashed border-line2 p-3">
                {t('rooms')}
              </div>
            </div>
          </div>
        </section>

        {/* Results region — gated on validity (FR-SHELL-04); announced politely. */}
        <section aria-label={t('perRoom')} aria-live="polite">
          {showResults ? (
            <div className="rounded-xl border border-line bg-panel p-4 text-sm text-muted">
              {/* Result sections (module summary, bands, per-room, visualizer) fill this. */}
              {t('perRoom')}
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
