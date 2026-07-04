'use client';

import {
  computeWalkways,
  walkwayMeterBars,
  FURNITURE_DEPTHS,
  type WalkwayRating,
  type WalkwayRecommendationKey,
} from '../lib/calculations';
import { type Room } from '../lib/app-state';
import { useI18n, type TranslationKey } from '../lib/i18n-context';

/** The three furniture presets (DESIGN §6.3), each with its depth and furniture-label key. */
const PRESETS: { labelKey: TranslationKey; depth: number }[] = [
  { labelKey: 'wardrobe', depth: FURNITURE_DEPTHS.wardrobeKitchen },
  { labelKey: 'sofa', depth: FURNITURE_DEPTHS.sofa },
  { labelKey: 'facing', depth: FURNITURE_DEPTHS.facingUnits },
];

/**
 * Rating → text + bar color classes + i18n rating label. Classes are written out in full (not
 * built dynamically) so Tailwind's static extraction keeps them. Meaning is carried by the label
 * and the meter, not color alone.
 */
const RATING_META: Record<WalkwayRating, { text: string; bar: string; label: TranslationKey }> = {
  comfortable: { text: 'text-good', bar: 'bg-good', label: 'comfortable' },
  acceptable: { text: 'text-warn', bar: 'bg-warn', label: 'acceptable' },
  tight: { text: 'text-err', bar: 'bg-err', label: 'tight' },
};

/** The engine's locale-independent recommendation key → the shipped guidance i18n key. */
const RECOMMENDATION_I18N: Record<WalkwayRecommendationKey, TranslationKey> = {
  'walkway.comfortable': 'recComf',
  'walkway.acceptable': 'recAcc',
  'walkway.tight': 'recTight',
};

/**
 * Walkway-clearance block for one room (DESIGN §6.3): three furniture-preset rows, each showing
 * the available clearance, a fixed-mm comfort rating (never scales with M — BC-WALK-01), a 3-bar
 * meter, and localized guidance. The third and final block in the per-room card. Read-only.
 */
export function WalkwayBlock({ room }: { room: Room }) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-fg2">{t('walkway')}</span>
      <ul className="space-y-2">
        {PRESETS.map(({ labelKey, depth }) => {
          const { available, rating, recommendation } = computeWalkways(room.width, depth);
          const meta = RATING_META[rating];
          const bars = walkwayMeterBars(rating);
          return (
            <li key={labelKey} className="space-y-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] text-fg">{t(labelKey)}</span>
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-[13px] text-fg2">{available} mm</span>
                  {/* 3-bar meter, filled by rating. */}
                  <span className="inline-flex gap-0.5" aria-hidden="true">
                    {[1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`h-2.5 w-1 rounded-sm ${i <= bars ? meta.bar : 'bg-line2'}`}
                      />
                    ))}
                  </span>
                  <span className={`text-[11px] font-medium ${meta.text}`}>{t(meta.label)}</span>
                </span>
              </div>
              <p className="text-[11px] text-muted">{t(RECOMMENDATION_I18N[recommendation])}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
