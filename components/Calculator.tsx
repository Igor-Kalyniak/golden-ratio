'use client';

import { useCallback, useMemo, useState } from 'react';

import { LanguageProvider } from '../lib/i18n-context';
import {
  DEFAULT_STATE,
  showResults,
  withCeiling,
  withModule,
  withOpening,
  type AppState,
} from '../lib/app-state';
import { Shell } from './Shell';

/**
 * The single `'use client'` boundary (TC-CLIENT-01) and the application state owner
 * (TC-ARCH-01). Holds `AppState` and derives `showResults` synchronously — no effects in the
 * compute path (NFR-PERF-01). Mounts the shipped `LanguageProvider`; the string-consuming UI
 * lives in `Shell` (a provider descendant), so this component does not call `useI18n` itself.
 *
 * Apartment-field edits (change 5) go through the pure reducers in `lib/app-state.ts` so the
 * "module follows the suggestion until overridden" rule (FR-APT-03) is a single, tested unit
 * rather than duplicated inline logic. The room-list setter (change 6) extends this the same
 * way.
 */
export function Calculator() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const results = useMemo(() => showResults(state), [state]);

  const onCeilingChange = useCallback(
    (ceiling: number) => setState((prev) => withCeiling(prev, ceiling)),
    [],
  );
  const onOpeningChange = useCallback(
    (opening: number) => setState((prev) => withOpening(prev, opening)),
    [],
  );
  const onModuleChange = useCallback(
    (module: number) => setState((prev) => withModule(prev, module)),
    [],
  );

  return (
    <LanguageProvider>
      <Shell
        state={state}
        showResults={results}
        onCeilingChange={onCeilingChange}
        onOpeningChange={onOpeningChange}
        onModuleChange={onModuleChange}
      />
    </LanguageProvider>
  );
}
