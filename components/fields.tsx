'use client';

import { BOUNDS } from '../lib/calculations';

/**
 * Shared form-field primitives for the apartment card and room list. Both forms render the same
 * inline-validated number input; the only difference is scale, so it lives here once with a `size`
 * variant instead of being copy-pasted (see components/ApartmentForm.tsx and components/RoomList.tsx).
 */

type FieldSize = 'md' | 'sm';

/** Per-size Tailwind classes; `md` is the apartment card, `sm` the denser room cards. */
const SIZE_CLASSES: Record<FieldSize, { label: string; hint: string; input: string; unit: string }> = {
  md: {
    label: 'text-sm text-fg2',
    hint: 'font-mono text-[11px] text-faint',
    input: 'px-3 py-2 pr-9 text-[15px]',
    unit: 'right-3 text-xs',
  },
  sm: {
    label: 'text-xs text-fg2',
    hint: 'font-mono text-[10px] text-faint',
    input: 'px-2.5 py-1.5 pr-8 text-sm',
    unit: 'right-2.5 text-[11px]',
  },
};

/** The dimension hint text (`500–15000`), derived from the engine bounds so it can't drift. */
export const DIMENSION_HINT = `${BOUNDS.dimension.min}–${BOUNDS.dimension.max}`;

export function InlineError({ id, text }: { id: string; text: string }) {
  return (
    <p role="alert" id={id} className="mt-1 text-xs text-err">
      <strong aria-hidden="true" className="mr-1">
        !
      </strong>
      {text}
    </p>
  );
}

export function NumberField({
  id,
  label,
  hint,
  value,
  invalid,
  errorText,
  onChange,
  size = 'md',
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  invalid: boolean;
  errorText: string;
  onChange: (value: number) => void;
  size?: FieldSize;
}) {
  const s = SIZE_CLASSES[size];
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hintId, invalid ? errorId : null].filter(Boolean).join(' ');
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label htmlFor={id} className={s.label}>
          {label}
        </label>
        <span id={hintId} className={s.hint}>
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
          className={`w-full rounded-md border bg-field font-mono text-fg ${s.input} ${
            invalid ? 'border-err' : 'border-line2'
          }`}
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-faint ${s.unit}`}
        >
          mm
        </span>
      </div>
      {invalid && <InlineError id={errorId} text={errorText} />}
    </div>
  );
}
