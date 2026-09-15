'use client';

import { computeRoomGrid, gridRoundDirection } from '../lib/calculations';
import { type Room } from '../lib/app-state';
import { useI18n, type TranslationKey } from '../lib/i18n-context';

/** Signed integer with an explicit + / − sign (0 stays "0"). */
const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

/** Quality → { i18n key, glyph, Tailwind color classes } — text+glyph, never color alone. */
const QUALITY_BADGE: Record<
  'exact' | 'close' | 'poor',
  { key: TranslationKey; glyph: string; cls: string }
> = {
  exact: { key: 'qexact', glyph: '✓', cls: 'bg-good-bg text-good' },
  close: { key: 'qclose', glyph: '≈', cls: 'bg-warn-bg text-warn' },
  poor: { key: 'qpoor', glyph: '✕', cls: 'bg-err-bg text-err' },
};

/**
 * Grid-fit block for one room (DESIGN §6.3): `nL × nW` modules, signed remainders with a
 * round-up/round-down annotation, and an accessible quality badge. The second block in the
 * per-room card, below the golden split. Read-only; recomputes synchronously from props.
 */
export function GridFitBlock({ room, module: activeModule }: { room: Room; module: number }) {
  const { t } = useI18n();
  const { lengthModules, widthModules, lengthRemainder, widthRemainder, quality } = computeRoomGrid(
    room.length,
    room.width,
    activeModule,
  );
  const badge = QUALITY_BADGE[quality];

  // Round-direction annotations for each non-zero remainder (FR-GRID-03).
  const annotations = (
    [
      [lengthRemainder, 'onLength'],
      [widthRemainder, 'onWidth'],
    ] as const
  )
    .map(([rem, dimKey]) => {
      const dir = gridRoundDirection(rem);
      return dir === null ? null : `${t(dir)} ${t(dimKey)}`;
    })
    .filter((a): a is string => a !== null);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-fg2">{t('gridFit')}</span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.cls}`}
        >
          <span aria-hidden="true">{badge.glyph}</span>
          {t(badge.key)}
        </span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[19px] text-fg">
          {lengthModules} × {widthModules}
        </span>
        <span className="font-mono text-xs text-muted">
          {t('remainder')} {signed(lengthRemainder)} / {signed(widthRemainder)}
        </span>
      </div>
      {annotations.length > 0 && (
        <p className="text-[11px] italic text-warn">{annotations.join(' · ')}</p>
      )}
    </div>
  );
}
