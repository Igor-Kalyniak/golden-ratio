'use client';

import { STANDARD_MODULES, isValidCeiling, isValidOpening } from '../lib/calculations';
import { type Mode } from '../lib/app-state';
import { useI18n } from '../lib/i18n-context';

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

function NumberField({
  id,
  label,
  hint,
  value,
  invalid,
  errorText,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  invalid: boolean;
  errorText: string;
  onChange: (value: number) => void;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hintId, invalid ? errorId : null].filter(Boolean).join(' ');
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm text-fg2">
          {label}
        </label>
        <span id={hintId} className="font-mono text-[11px] text-faint">
          {hint}
        </span>
      </div>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          step={1}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`w-full rounded-md border bg-field px-3 py-2 pr-9 font-mono text-[15px] text-fg ${
            invalid ? 'border-err' : 'border-line2'
          }`}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint"
        >
          mm
        </span>
      </div>
      {invalid && (
        <p role="alert" id={errorId} className="mt-1 text-xs text-err">
          <strong aria-hidden="true" className="mr-1">
            !
          </strong>
          {errorText}
        </p>
      )}
    </div>
  );
}
