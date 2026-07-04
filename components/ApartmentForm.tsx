'use client';

import { STANDARD_MODULES, isValidCeiling, isValidOpening } from '../lib/calculations';
import { type Mode } from '../lib/app-state';
import { useI18n } from '../lib/i18n-context';
import { NumberField } from './fields';

interface ApartmentFormProps {
  mode: Mode;
  ceiling: number;
  opening: number;
  module: number;
  /** The mode-appropriate suggested module (heights in 3D, room dims in 2D). */
  suggested: number;
  onCeilingChange: (value: number) => void;
  onOpeningChange: (value: number) => void;
  onModuleChange: (value: number) => void;
}

/**
 * The apartment card (DESIGN §5.2): ceiling, opening, and module fields. Reactive — no
 * submit button, every change recomputes synchronously (FR-APT-05). In 2D mode the height
 * fields are hidden (FR-MODE-02) and only the shared module `<select>` remains; the suggested
 * option is annotated from the mode-appropriate `suggested` prop.
 */
export function ApartmentForm({
  mode,
  ceiling,
  opening,
  module: activeModule,
  suggested,
  onCeilingChange,
  onOpeningChange,
  onModuleChange,
}: ApartmentFormProps) {
  const { t } = useI18n();
  const ceilingInvalid = !isValidCeiling(ceiling);
  const openingInvalid = !isValidOpening(opening, ceiling);

  return (
    <div className="space-y-3.5 rounded-xl border border-line bg-panel p-4">
      {mode === '3d' && (
        <>
          <NumberField
            id="apt-ceiling"
            label={t('ceiling')}
            hint={t('rngCeiling')}
            value={ceiling}
            invalid={ceilingInvalid}
            errorText={t('errCeiling')}
            onChange={onCeilingChange}
          />
          <NumberField
            id="apt-opening"
            label={t('opening')}
            hint={t('rngOpening')}
            value={opening}
            invalid={openingInvalid}
            errorText={t('errOpening')}
            onChange={onOpeningChange}
          />
        </>
      )}

      <div>
        <div className="mb-1 flex items-baseline gap-2">
          <label htmlFor="apt-module" className="text-sm text-fg2">
            {t('module')}
          </label>
          <span className="rounded-full bg-accent-bg px-1.5 py-0.5 text-[10px] font-medium text-accent">
            {t('overridable')}
          </span>
        </div>
        <select
          id="apt-module"
          value={activeModule}
          onChange={(e) => onModuleChange(Number(e.target.value))}
          className="w-full rounded-md border border-line2 bg-field px-3 py-2 font-mono text-[15px] text-fg"
        >
          {STANDARD_MODULES.map((m) => (
            <option key={m} value={m}>
              {m === suggested ? `${m} — ${t('suggested')}` : m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
