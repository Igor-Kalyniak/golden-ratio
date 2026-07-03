'use client';

import { useCallback, useMemo, useState } from 'react';

import { LanguageProvider } from '../lib/i18n-context';
import {
  addRoom,
  DEFAULT_STATE,
  moduleSuggestion,
  removeRoom,
  showResults,
  updateRoom,
  withCeiling,
  withMode,
  withModule,
  withOpening,
  type AppState,
  type Mode,
  type Room,
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
  // The mode-appropriate module suggestion (heights in 3D, room dims in 2D), computed once and
  // flowed down as props so leaves never recompute it (TC-ARCH-01).
  const suggestion = useMemo(() => moduleSuggestion(state), [state]);

  const onModeChange = useCallback(
    (mode: Mode) => setState((prev) => withMode(prev, mode)),
    [],
  );
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

  const onAddRoom = useCallback(() => setState((prev) => addRoom(prev)), []);
  const onRemoveRoom = useCallback(
    (id: string) => setState((prev) => removeRoom(prev, id)),
    [],
  );
  const onRoomChange = useCallback(
    (id: string, patch: Partial<Pick<Room, 'name' | 'length' | 'width'>>) =>
      setState((prev) => updateRoom(prev, id, patch)),
    [],
  );

  return (
    <LanguageProvider>
      <Shell
        state={state}
        showResults={results}
        suggestion={suggestion}
        onModeChange={onModeChange}
        onCeilingChange={onCeilingChange}
        onOpeningChange={onOpeningChange}
        onModuleChange={onModuleChange}
        onAddRoom={onAddRoom}
        onRemoveRoom={onRemoveRoom}
        onRoomChange={onRoomChange}
      />
    </LanguageProvider>
  );
}
