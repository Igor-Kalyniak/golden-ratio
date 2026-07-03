'use client';

import { useMemo, useState } from 'react';

import { LanguageProvider } from '../lib/i18n-context';
import { DEFAULT_STATE, showResults, type AppState } from '../lib/app-state';
import { Shell } from './Shell';

/**
 * The single `'use client'` boundary (TC-CLIENT-01) and the application state owner
 * (TC-ARCH-01). Holds `AppState` and derives `showResults` synchronously — no effects in the
 * compute path (NFR-PERF-01). Mounts the shipped `LanguageProvider`; the string-consuming UI
 * lives in `Shell` (a provider descendant), so this component does not call `useI18n` itself.
 *
 * The setter is introduced when the apartment fields (change 5) and room list (change 6) wire
 * real editing; for the empty shell the default state is valid, so results render.
 */
export function Calculator() {
  const [state] = useState<AppState>(DEFAULT_STATE);
  const results = useMemo(() => showResults(state), [state]);

  return (
    <LanguageProvider>
      <Shell showResults={results} />
    </LanguageProvider>
  );
}
