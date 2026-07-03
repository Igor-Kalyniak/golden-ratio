'use client';

import {
  computeModuleRuler,
  moduleWarning,
  suggestModule,
} from '../lib/calculations';
import { useI18n, type TranslationKey } from '../lib/i18n-context';

interface ModuleSummaryProps {
  /** The active module — the user's selection (default `suggested`), never the raw GCD. */
  module: number;
  ceiling: number;
  opening: number;
}

/** Ruler "typical use" i18n keys, index-aligned to CALC_LABELS / RULER_FACTORS (¼M…4M). */
const RULER_USE_KEYS: TranslationKey[] = [
  'useQuarterM',
  'useHalfM',
  'useM',
  'useM15',
  'useM2',
  'useM3',
  'useM4',
];

/**
 * Module Summary (DESIGN §6.1) — the first result section and the linchpin that surfaces the
 * active module every downstream result reads (FR-MODULE-02, BC-MODULE-01). Read-only: it
 * displays `state.module` verbatim and only calls `suggestModule` to render the traceability
 * hint; it never edits state (the selector lives in the apartment card).
 */
export function ModuleSummary({ module: activeModule, ceiling, opening }: ModuleSummaryProps) {
  const { t } = useI18n();
  const { rawGcd, suggested, residual, alternatives } = suggestModule(ceiling, opening);
  const ruler = computeModuleRuler(activeModule);
  const warning = moduleWarning(activeModule);

  return (
    <section className="space-y-4 rounded-xl border border-line bg-panel p-4">
      <h3 className="text-sm font-semibold">{t('moduleSummary')}</h3>

      {/* Two-pane: hero + traceability hint (FR-MODULE-03). */}
      <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
        <div className="rounded-lg bg-panel2 px-5 py-4 text-center">
          <div className="text-[11px] uppercase tracking-wide text-muted">{t('activeModule')}</div>
          <div className="font-mono text-[34px] font-semibold leading-none text-fg">
            M = {activeModule}
          </div>
          <div className="mt-1 text-xs text-muted">mm</div>
        </div>

        <div className="flex flex-col justify-center gap-2 text-sm">
          <p className="text-muted">
            <span className="text-fg2">{t('suggestedFrom')}</span>
            <span className="ml-1 font-mono text-fg">
              GCD({ceiling}, {opening}) = {rawGcd} → {t('snappedTo')} {suggested}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${
                residual === 0 ? 'bg-good-bg text-good' : 'bg-warn-bg text-warn'
              }`}
            >
              {t('residual')} {residual} mm
            </span>
            {alternatives.length > 0 && (
              <span className="text-xs text-muted">{t('alternatives')}:</span>
            )}
            {alternatives.map((alt) => (
              <span
                key={alt}
                className="rounded-full border border-line2 bg-field px-2 py-0.5 font-mono text-[11px] text-fg2"
              >
                {alt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Impractical-module warning (FR-MODULE-05) — only when out of practical range. */}
      {warning !== null && (
        <p
          role="alert"
          className="rounded-lg bg-warn-bg px-3 py-2 text-sm text-warn"
        >
          {t(warning === 'large' ? 'warnLarge' : 'warnSmall')}
        </p>
      )}

      {/* Module ruler (FR-MODULE-04) — labels never translated, use prose localized. */}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-muted">
            <th className="pb-1 font-medium">{t('colLabel')}</th>
            <th className="pb-1 font-medium">{t('colSize')}</th>
            <th className="pb-1 font-medium">{t('colUse')}</th>
          </tr>
        </thead>
        <tbody>
          {ruler.map((row, i) => (
            <tr key={row.label} className="border-t border-line">
              <td className="py-1 font-mono text-accent">{row.label}</td>
              <td className="py-1 font-mono text-fg">{row.size}</td>
              <td className="py-1 text-muted">{t(RULER_USE_KEYS[i])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
