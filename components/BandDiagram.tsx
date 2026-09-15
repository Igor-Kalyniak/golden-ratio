'use client';

import { layoutBandDiagram, type BandNameKey } from '../lib/calculations';
import { useI18n, type TranslationKey } from '../lib/i18n-context';

interface BandDiagramProps {
  ceiling: number;
  module: number;
  opening: number;
}

/** Map the engine's locale-independent band-name keys to i18n dictionary keys. */
const BAND_NAME_I18N: Record<BandNameKey, TranslationKey> = {
  'band.basePlinth': 'bandBasePlinth',
  'band.workZone': 'bandWorkZone',
  'band.doorHead': 'bandDoorHead',
  'band.upperCeiling': 'bandUpperCeiling',
};

// viewBox geometry (FR-VERT-05 + DESIGN §6.2): proportional, width-responsive, no fixed pixel
// size. 360×470 (DESIGN) leaves a wide right gutter (bands end at x=228) so band-name and
// opening labels fit without clipping in either locale — satisfies the FR-VERT-06 legibility
// requirement, which the narrower PDR literal (200×400) could not.
const VB_W = 360;
const VB_H = 470;
const PAD_T = 14;
const PAD_B = 14;
const BAND_X = 78;
const BAND_W = 150;

/**
 * Vertical band diagram (DESIGN §6.2) — a width-responsive `viewBox` SVG showing the ceiling
 * split into `floor(ceiling/module)` full bands + a partial leftover band, with mm marks, band
 * names, and the opening's on/off-grid marker. Read-only; recomputes synchronously from props.
 * Renders whenever results are shown; `mode-toggle` (change 13) will later gate it on 3D mode.
 */
export function BandDiagram({ ceiling, module: activeModule, opening }: BandDiagramProps) {
  const { t } = useI18n();
  const { bands, marks, opening: overlay } = layoutBandDiagram(ceiling, activeModule, opening);

  const usable = VB_H - PAD_T - PAD_B;
  const yOf = (mm: number) => PAD_T + ((ceiling - mm) / ceiling) * usable;

  return (
    <section className="space-y-3 rounded-xl border border-line bg-panel p-4">
      <h3 className="text-sm font-semibold">
        {t('bandDiagram')}{' '}
        <span className="font-mono text-xs text-muted">
          {bands.filter((b) => !b.partial).length} {t('bands')}
        </span>
      </h3>

      <div className="mx-auto w-full max-w-[520px]">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-auto w-full"
          role="img"
          aria-label={t('bandDiagram')}
        >
          {/* Bands */}
          {bands.map((band) => {
            const y = yOf(band.to);
            const h = ((band.to - band.from) / ceiling) * usable;
            return (
              <g key={band.index}>
                <rect
                  x={BAND_X}
                  y={y}
                  width={BAND_W}
                  height={h}
                  fill={band.partial ? 'var(--accent-bg)' : band.alt ? 'var(--inset)' : 'var(--panel2)'}
                  stroke="var(--line)"
                  strokeWidth={0.5}
                  strokeDasharray={band.partial ? '4 3' : undefined}
                />
                <text
                  x={BAND_X + BAND_W + 6}
                  y={y + h / 2}
                  dominantBaseline="middle"
                  className="fill-[var(--fg2)] font-sans"
                  fontSize={7}
                >
                  {t(BAND_NAME_I18N[band.nameKey])}
                  {band.partial ? ` · ${t('partial')} ${band.span} mm` : ''}
                </text>
              </g>
            );
          })}

          {/* mm marks up the left edge (labels condensed at high counts). */}
          {marks.map((mark) => {
            const y = yOf(mark.mm);
            return (
              <g key={mark.mm}>
                <line x1={BAND_X - 4} y1={y} x2={BAND_X} y2={y} stroke="var(--line2)" strokeWidth={0.5} />
                {!mark.condensedOut && (
                  <text
                    x={BAND_X - 6}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-[var(--muted)] font-mono"
                    fontSize={7}
                  >
                    {mark.mm}
                  </text>
                )}
              </g>
            );
          })}

          {/* Opening marker: dashed accent rule + dot at the true height (FR-VERT-04). */}
          {overlay !== null && (
            <g>
              <line
                x1={BAND_X}
                y1={yOf(overlay.mm)}
                x2={BAND_X + BAND_W}
                y2={yOf(overlay.mm)}
                stroke="var(--accent)"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <circle cx={BAND_X} cy={yOf(overlay.mm)} r={2.5} fill="var(--accent)" />
              <text
                x={BAND_X + BAND_W + 6}
                y={yOf(overlay.mm)}
                dominantBaseline="middle"
                className="fill-[var(--accent)] font-mono"
                fontSize={7}
              >
                {t('openingLine')} · {t(overlay.aligned ? 'aligned' : 'offGrid')}
              </text>
            </g>
          )}
        </svg>
      </div>
    </section>
  );
}
