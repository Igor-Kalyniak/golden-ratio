'use client';

import {
  computeGoldenSplit,
  isApproximateFit,
  longerWall,
} from '../lib/calculations';
import { isRoomValid, type Room } from '../lib/app-state';
import { useI18n } from '../lib/i18n-context';
import { GoldenSplitBlock } from './GoldenSplitBlock';

interface PerRoomResultsProps {
  rooms: Room[];
  module: number;
}

/**
 * Per-room result cards (DESIGN §6.3) — one card per valid room, each a header (name + dims +
 * fit badge) over a stack of result blocks. This change owns the card scaffold + the golden
 * block; grid-fit (10) and walkway (11) add their blocks in the same slot. Read-only.
 */
export function PerRoomResults({ rooms, module: activeModule }: PerRoomResultsProps) {
  const { t } = useI18n();
  const validRooms = rooms.filter(isRoomValid);

  return (
    <section className="space-y-3 rounded-xl border border-line bg-panel p-4">
      <h3 className="text-sm font-semibold">{t('perRoom')}</h3>
      <div className="space-y-3">
        {validRooms.map((room) => {
          // Compute the golden split once here; the header fit badge and the block below both
          // read it, so the fit decision has a single source of truth (review CR-001).
          const longer = longerWall(room);
          const split = computeGoldenSplit(longer, activeModule);
          const approx = isApproximateFit(split.snapOffset, activeModule);
          return (
            <article key={room.id} className="space-y-3 rounded-lg border border-line2 bg-field/40 p-3">
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-fg">{room.name}</span>
                  <span className="font-mono text-[11px] text-muted">
                    {room.length} × {room.width} mm
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    approx ? 'bg-warn-bg text-warn' : 'bg-good-bg text-good'
                  }`}
                >
                  <span aria-hidden="true">{approx ? '≈' : '✓'}</span>
                  {t(approx ? 'approxFit' : 'cleanFit')}
                </span>
              </header>
              <GoldenSplitBlock longer={longer} split={split} approx={approx} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
