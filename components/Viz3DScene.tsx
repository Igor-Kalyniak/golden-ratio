'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Group, Mesh } from 'three';

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
const ACCENT = '#c8823c'; // accent highlight (mirrors --accent; three needs a literal color)

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
          <RoomBox key={room.id} layout={layout} m={m} scale={scale} x={x} reduced={reduced} />
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
}: {
  layout: ReturnType<typeof layoutRoom3D>;
  m: number;
  scale: number;
  x: number;
  reduced: boolean;
}) {
  const cube = useRef<Mesh>(null);
  const group = useRef<Group>(null);
  const w = layout.l * scale;
  const h = layout.h * scale;
  const d = layout.w * scale;
  const cellS = m * scale;

  // Gentle highlight float/pulse (FR-VIZ3D-04); suppressed under reduced-motion (FR-VIZ3D-05).
  useFrame(({ clock }) => {
    if (reduced || !cube.current) return;
    const t = clock.getElapsedTime();
    cube.current.position.y = -h / 2 + cellS / 2 + Math.sin(t * 1.6) * cellS * 0.12;
  });

  const openingScene = layout.openingY !== null ? layout.openingY * scale - h / 2 : null;

  return (
    <group ref={group} position={[x, 0, 0]}>
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
          <meshBasicMaterial color={ACCENT} />
        </mesh>
      )}

      {/* Exactly one highlighted M³ cube at the bottom-front-left corner (FR-VIZ3D-03). */}
      <mesh ref={cube} position={[-w / 2 + cellS / 2, -h / 2 + cellS / 2, d / 2 - cellS / 2]}>
        <boxGeometry args={[cellS, cellS, cellS]} />
        <meshStandardMaterial color={ACCENT} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
