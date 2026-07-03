'use client';

import {
  computeGoldenSplit,
  isApproximateFit,
  longerWall,
} from '../lib/calculations';
import { type Room } from '../lib/app-state';
import { useI18n } from '../lib/i18n-context';

/** One-decimal for exact segments, integer for snapped grid values (DESIGN §6.3). */
const dec1 = (n: number) => n.toFixed(1);

/**
 * Golden-ratio split block for one room (DESIGN §6.3): the split of the longer wall into exact
 * 0.618/0.382 segments, the ½M-snapped values, and the snap offset colored by fit. The first
 * block in the per-room card; grid-fit (10) and walkway (11) add sibling blocks. Read-only.
 */
export function GoldenSplitBlock({ room, module: activeModule }: { room: Room; module: number }) {
  const { t } = useI18n();
  const longer = longerWall(room);
  const { larger, smaller, largerSnapped, smallerSnapped, snapOffset } = computeGoldenSplit(
    longer,
    activeModule,
  );
  const approx = isApproximateFit(snapOffset, activeModule);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-fg2">{t('goldenSplit')}</span>
        <span className="font-mono text-[11px] text-muted">
          {t('longerWall')} {longer} mm
        </span>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-[11px] text-muted">{t('exact')}</dt>
          <dd className="font-mono text-fg">
            {dec1(larger)} / {dec1(smaller)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted">{t('snappedVals')}</dt>
          <dd className="font-mono text-accent">
            {largerSnapped} / {smallerSnapped}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted">{t('snapOffset')}</dt>
          <dd className={`font-mono ${approx ? 'text-warn' : 'text-good'}`}>{dec1(snapOffset)} mm</dd>
        </div>
      </dl>
    </div>
  );
}
