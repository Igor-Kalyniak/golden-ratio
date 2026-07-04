'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Mesh } from 'three';

import { layoutRoom3D, interiorModuleLines } from '../lib/calculations';
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
const LATTICE_COLOR = '#5a6474'; // matches the box wireframe / 2D `--line` — faint, neutral, not chrome
const REMAINDER_COLOR = '#d97706'; // warn tone — the 3D analogue of the 2D `--warn-bg` remainder strip
// Per-room lattice cap (NFR-PERF-03): when a room's total module divisions exceed this (a tiny module
// relative to a large room), the faint lattice is skipped so line geometry stays bounded — the box,
// remainder slabs, and highlighted cube always render.
const MAX_LATTICE_DIVISIONS = 40;
const EPS = 1e-4;

/**
 * Flat `[x1,y1,z1, x2,y2,z2, …]` line-segment vertices for the faint M³ module lattice on a box of
 * scene extents `w × h × d` (FR-VIZ3D-07), from the centered interior grid offsets per axis (`xs`,
 * `ys`, `zs` — already scaled to scene units). The lattice is drawn on the three faces meeting at
 * the front-bottom-left corner (floor, front, left): the floor face is the direct 3D parity of the
 * 2D plan grid, and the two wall faces convey the vertical (layer) tiling. Returns `null` when the
 * module divisions exceed the per-room cap (NFR-PERF-03). The offset math lives in the pure,
 * unit-tested `interiorModuleLines` engine helper — this only assembles segments.
 */
function buildLatticeSegments(
  xs: number[],
  ys: number[],
  zs: number[],
  w: number,
  h: number,
  d: number,
): Float32Array | null {
  if (xs.length + ys.length + zs.length > MAX_LATTICE_DIVISIONS) return null;

  const v: number[] = [];
  const line = (a: [number, number, number], b: [number, number, number]) => v.push(...a, ...b);
  const y0 = -h / 2;
  const z1 = d / 2;
  const x0 = -w / 2;
  // Floor (y = -h/2): the 2D plan grid — lines along x (per z) and along z (per x).
  for (const z of zs) line([-w / 2, y0, z], [w / 2, y0, z]);
  for (const x of xs) line([x, y0, -d / 2], [x, y0, d / 2]);
  // Front face (z = +d/2): height tiling — lines along x (per y) and along y (per x).
  for (const y of ys) line([-w / 2, y, z1], [w / 2, y, z1]);
  for (const x of xs) line([x, -h / 2, z1], [x, h / 2, z1]);
  // Left face (x = -w/2): depth × height tiling — lines along z (per y) and along y (per z).
  for (const y of ys) line([x0, y, -d / 2], [x0, y, d / 2]);
  for (const z of zs) line([x0, -h / 2, z], [x0, h / 2, z]);
  return new Float32Array(v);
}

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
  const step = m * scale;
  // Clamp the highlight cube to the box so a room smaller than one module doesn't overflow the
  // walls (mirrors the 2D visualizer's Math.min clamp — CR-003).
  const cellS = Math.min(m * scale, w, h, d);
  const baseY = -h / 2 + cellS / 2;

  // Faint M³ lattice on the three corner faces (FR-VIZ3D-07); null when past the per-room cap.
  // Interior line offsets come from the pure, tested `interiorModuleLines` (mm), mapped to centered
  // scene units (−ext/2 + pos·scale) so the lattice shares one rule with the 2D grid.
  const lattice = useMemo(() => {
    const xs = interiorModuleLines(layout.l, m).map((p) => -w / 2 + p * scale);
    const ys = interiorModuleLines(layout.h, m).map((p) => -h / 2 + p * scale);
    const zs = interiorModuleLines(layout.w, m).map((p) => -d / 2 + p * scale);
    return buildLatticeSegments(xs, ys, zs, w, h, d);
  }, [layout, m, scale, w, h, d]);
  // Signed remainder slabs on the far faces — the 3D analogue of Viz2D's `--warn-bg` edge strips.
  const remL = layout.lengthRemainder * scale;
  const remW = layout.widthRemainder * scale;
  const remH = layout.heightRemainder * scale;

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

      {/* Faint M³ module lattice on the floor + two corner walls (FR-VIZ3D-07). Keyed on the
          extents so a changed grid remounts (disposing the old geometry). */}
      {lattice && (
        <lineSegments key={`${w}x${h}x${d}x${step}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[lattice, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={LATTICE_COLOR} transparent opacity={0.4} />
        </lineSegments>
      )}

      {/* Signed remainder slabs on the far faces (FR-VIZ3D-07) — leftover past the last whole
          module per axis; omitted when the dimension divides evenly (remainder 0). */}
      {remL > EPS && (
        <mesh position={[w / 2 - remL / 2, 0, 0]}>
          <boxGeometry args={[remL, h, d]} />
          <meshBasicMaterial color={REMAINDER_COLOR} transparent opacity={0.16} depthWrite={false} />
        </mesh>
      )}
      {remW > EPS && (
        <mesh position={[0, 0, d / 2 - remW / 2]}>
          <boxGeometry args={[w, h, remW]} />
          <meshBasicMaterial color={REMAINDER_COLOR} transparent opacity={0.16} depthWrite={false} />
        </mesh>
      )}
      {remH > EPS && (
        <mesh position={[0, h / 2 - remH / 2, 0]}>
          <boxGeometry args={[w, remH, d]} />
          <meshBasicMaterial color={REMAINDER_COLOR} transparent opacity={0.16} depthWrite={false} />
        </mesh>
      )}

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
