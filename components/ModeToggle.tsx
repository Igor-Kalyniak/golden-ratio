'use client';

import { type Mode } from '../lib/app-state';
import { useI18n } from '../lib/i18n-context';

interface ModeToggleProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

const SEGMENTS: readonly Mode[] = ['3d', '2d'];

/**
 * Segmented 2D ⇄ 3D calculation-mode toggle (DESIGN §5.1, FR-MODE-01). Two `aria-pressed`
 * buttons in a labelled group — keyboard-operable with a clear selected state (NFR-A11Y-03).
 * The `2D`/`3D` labels are universal mode names and are not translated.
 */
export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  const { t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t('mode')}
      className="inline-flex rounded-lg border border-line2 bg-panel2 p-0.5"
    >
      {SEGMENTS.map((seg) => {
        const selected = mode === seg;
        return (
          <button
            key={seg}
            type="button"
            aria-pressed={selected}
            onClick={() => onModeChange(seg)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              selected ? 'bg-accent text-accent-fg' : 'text-fg2 hover:text-fg'
            }`}
          >
            {seg.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
