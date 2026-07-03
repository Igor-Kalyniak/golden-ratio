'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Mesh } from 'three';

import { layoutRoom3D } from '../lib/calculations';
import { isRoomValid, type Room } from '../lib/app-state';

interface Viz3DSceneProps {
  rooms: Room[];
  module: number;
  ceiling: number;
  opening: number;
}

// mm → scene units: the largest room dimension maps to ~2.4 units, so the scene fits the camera.
const TARGET_UNITS = 2.4;
const GAP = 0.5; // between-room gap in scene units
const ACCENT_FALLBACK = 'rgb(37, 99, 235)'; // used only until the CSS --accent is sampled

/** Resolve `var(--accent)` to its used `rgb(...)` value via a hidden probe (client-only). */
function readAccent(): string {
  const probe = document.createElement('span');
  probe.style.color = 'var(--accent)';
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  return resolved || ACCENT_FALLBACK;
}

/**
 * Resolve the design `--accent` token to a three-parseable color string. three.Color can't read
 * CSS custom properties or oklch(), so the browser resolves `var(--accent)` to `rgb(...)`; the
 * lazy initializer reads it once and the effect only re-samples when the theme (`data-theme`)
 * changes — so the 3D highlight matches the 2D visualizer's `var(--accent)` in both themes without
 * a synchronous setState in the effect body.
 */
function useAccentColor(): string {
  const [accent, setAccent] = useState(readAccent);
  useEffect(() => {
    const observer = new MutationObserver(() => setAccent(readAccent()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return accent;
}

/** True when the user prefers reduced motion — disables idle animation (FR-VIZ3D-05). */
function usePrefersReducedMotion(): boolean {
  // Lazy initializer reads the current preference once (client-only; this component is ssr:false),
  // then the effect only subscribes to changes — no synchronous setState in the effect body.
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * The heavy `@react-three/fiber` 3D scene (FR-VIZ3D-01/02/03/04). This module is the ONLY importer
 * of `@react-three/*` and is loaded exclusively via `next/dynamic({ ssr:false })` in `Viz3D`, so
 * Three.js stays out of the 2D path and first paint (NFR-BUNDLE-01, TC-STACK-04). Read-only —
 * camera controls only, never edits geometry (BC-VALUE-01).
 */
export default function Viz3DScene({ rooms, module: m, ceiling, opening }: Viz3DSceneProps) {
  const reduced = usePrefersReducedMotion();
  const accent = useAccentColor();
  const valid = useMemo(() => rooms.filter(isRoomValid), [rooms]);

  // One shared mm → scene-unit scale across all rooms.
  const scale = useMemo(() => {
    const maxDim = Math.max(ceiling, ...valid.map((r) => Math.max(r.length, r.width)));
    return TARGET_UNITS / (maxDim || 1);
  }, [valid, ceiling]);

  // Lay rooms out along x, centered. `reduce` accumulates the running x-offset without mutating
  // a closure variable inside `.map` (keeps the render body free of post-render reassignment).
  const placed = useMemo(() => {
    const { items, cursor } = valid.reduce<{
      items: { room: Room; layout: ReturnType<typeof layoutRoom3D>; x: number }[];
      cursor: number;
    }>(
      (acc, room) => {
        const layout = layoutRoom3D(room.length, room.width, ceiling, m, opening);
        const w = layout.l * scale;
        acc.items.push({ room, layout, x: acc.cursor + w / 2 });
        return { items: acc.items, cursor: acc.cursor + w + GAP };
      },
      { items: [], cursor: 0 },
    );
    return { items, offset: Math.max(0, cursor - GAP) / 2 };
  }, [valid, ceiling, m, opening, scale]);

  return (
    <Canvas camera={{ position: [3.2, 2.6, 4.2], fov: 42 }} dpr={[1, 2]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} />
      <group position={[-placed.offset, 0, 0]}>
        {placed.items.map(({ room, layout, x }) => (
          <RoomBox
            key={room.id}
            layout={layout}
            m={m}
            scale={scale}
            x={x}
            reduced={reduced}
            accent={accent}
          />
        ))}
      </group>
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        autoRotate={!reduced}
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}

function RoomBox({
  layout,
  m,
  scale,
  x,
  reduced,
  accent,
}: {
  layout: ReturnType<typeof layoutRoom3D>;
  m: number;
  scale: number;
  x: number;
  reduced: boolean;
  accent: string;
}) {
  const cube = useRef<Mesh>(null);
  const w = layout.l * scale;
  const h = layout.h * scale;
  const d = layout.w * scale;
  // Clamp the highlight cube to the box so a room smaller than one module doesn't overflow the
  // walls (mirrors the 2D visualizer's Math.min clamp — CR-003).
  const cellS = Math.min(m * scale, w, h, d);
  const baseY = -h / 2 + cellS / 2;

  // Gentle highlight float (FR-VIZ3D-04); suppressed under reduced-motion (FR-VIZ3D-05).
  useFrame(({ clock }) => {
    if (reduced || !cube.current) return;
    cube.current.position.y = baseY + Math.sin(clock.getElapsedTime() * 1.6) * cellS * 0.12;
  });

  const openingScene = layout.openingY !== null ? layout.openingY * scale - h / 2 : null;

  return (
    <group position={[x, 0, 0]}>
      {/* Room volume — translucent so the interior cube reads. */}
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#8a93a6" transparent opacity={0.14} depthWrite={false} />
      </mesh>
      {/* Wireframe edges for the box outline. */}
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshBasicMaterial color="#5a6474" wireframe />
      </mesh>

      {/* Opening band on the front wall face (FR-VIZ3D-02). */}
      {openingScene !== null && (
        <mesh position={[0, openingScene, d / 2 + 0.001]}>
          <planeGeometry args={[w, Math.max(0.02, cellS * 0.08)]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      )}

      {/* Exactly one highlighted M³ cube at the bottom-front-left corner (FR-VIZ3D-03). */}
      <mesh ref={cube} position={[-w / 2 + cellS / 2, baseY, d / 2 - cellS / 2]}>
        <boxGeometry args={[cellS, cellS, cellS]} />
        <meshStandardMaterial color={accent} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
