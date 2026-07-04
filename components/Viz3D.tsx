'use client';

import { Component, useSyncExternalStore, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

import { type Room } from '../lib/app-state';
import { useI18n } from '../lib/i18n-context';
import { Viz2D } from './Viz2D';

interface Viz3DProps {
  rooms: Room[];
  module: number;
  ceiling: number;
  opening: number;
}

/**
 * The heavy R3F scene, loaded ONLY here via next/dynamic with ssr:false — Three.js becomes a
 * separate, lazily-fetched chunk so the 2D path and first paint carry no 3D dependency
 * (NFR-BUNDLE-01, TC-STACK-04). A loading placeholder shows while the chunk downloads (FR-VIZ3D-05).
 */
const Viz3DScene = dynamic(() => import('./Viz3DScene'), {
  ssr: false,
  loading: () => (
    <div className="grid h-[320px] place-items-center text-sm text-muted">…</div>
  ),
});

/** Cached one-shot WebGL probe (client-only) — the getContext call is done at most once. */
let webglCache: boolean | null = null;
function detectWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement('canvas');
    webglCache =
      (canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')) !== null;
  } catch {
    webglCache = false;
  }
  return webglCache;
}

/**
 * Catches a terminal failure of the lazy 3D chunk (e.g. a chunk-load error) — which `ssr:false`
 * does NOT guard against — and renders the 2D fallback instead of tearing down the WebGL branch and
 * leaving the user with nothing (FR-VIZ3D-06). There is no route-level error.tsx to catch this.
 */
class SceneErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// A never-changing external store: the client snapshot is the WebGL probe; the server snapshot is
// null (renders the neutral placeholder), so hydration is consistent and there is no effect-setState.
const subscribe = () => () => {};

/**
 * Detect WebGL support (FR-VIZ3D-06) via `useSyncExternalStore` — the idiomatic way to read a
 * client-only capability that differs from SSR without an effect. Returns null on the server / first
 * hydration pass (neutral placeholder), then true/false on the client.
 */
function useWebGLSupported(): boolean | null {
  return useSyncExternalStore<boolean | null>(subscribe, detectWebGL, () => null);
}

/**
 * 3D module visualizer wrapper (DESIGN §6.4). Thin and statically importable — it defers all
 * Three.js to the dynamic `Viz3DScene` import. When WebGL is unavailable it shows a graceful
 * message and falls back to the read-only 2D visualizer (FR-VIZ3D-06). Read-only throughout
 * (BC-VALUE-01); the numeric results remain the source of truth (NFR-A11Y-03).
 */
export function Viz3D({ rooms, module: m, ceiling, opening }: Viz3DProps) {
  const { t } = useI18n();
  const webgl = useWebGLSupported();

  // Shared graceful degradation to the shipped 2D visualizer (FR-VIZ3D-06) — used both when WebGL is
  // unavailable and when the 3D chunk fails to load/render.
  const twoDFallback = (
    <div className="space-y-3">
      <p role="status" className="rounded-lg bg-warn-bg px-3 py-2 text-sm text-warn">
        {t('webgl')}
      </p>
      <Viz2D rooms={rooms} module={m} />
    </div>
  );

  return (
    <section className="space-y-3 rounded-xl border border-line bg-panel p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-sm font-semibold">
          {t('visualizer')} <span className="font-mono text-xs text-muted">3D</span>
        </h3>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
          <span aria-hidden="true" className="inline-block h-3 w-3 rounded-sm bg-accent opacity-85" />
          {t('oneModule')}
        </span>
      </div>
      <p className="text-[11px] text-faint">{t('vizNote')}</p>

      {webgl === false ? (
        twoDFallback
      ) : webgl === true ? (
        <SceneErrorBoundary fallback={twoDFallback}>
          <div className="h-[320px] w-full overflow-hidden rounded-lg bg-panel2">
            <Viz3DScene rooms={rooms} module={m} ceiling={ceiling} opening={opening} />
          </div>
        </SceneErrorBoundary>
      ) : (
        // WebGL support not yet determined (first client tick) — reserve space, no Three.js yet.
        <div className="grid h-[320px] place-items-center text-sm text-muted" aria-hidden="true">
          …
        </div>
      )}
    </section>
  );
}
