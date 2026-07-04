'use client';

import { layoutRoom2D } from '../lib/calculations';
import { isRoomValid, type Room } from '../lib/app-state';
import { useI18n } from '../lib/i18n-context';

interface Viz2DProps {
  rooms: Room[];
  module: number;
}

// viewBox geometry: one shared mm→unit scale across all rooms (so sizes are comparable), padding
// around each rectangle. No fixed pixel size — the SVG scales via viewBox (FR-VIZ2D-01, NFR-PERF-03).
const TARGET = 168; // the largest room dimension maps to ~168 viewBox units
const PAD = 12;

/**
 * Read-only 2D module visualizer (DESIGN §6.4, FR-VIZ2D-*). One to-scale plan rectangle per valid
 * room in a wrapping row (not a floor plan), each tiled with a faint M×M grid, a `--warn-bg`
 * remainder strip on the far edge, and exactly one `--accent` highlighted module cell (cellpulse).
 * Comprehension aid only — no handlers, no editing, no export (BC-VALUE-01). Reduced-motion is
 * honored globally by `app/globals.css`. Rendered in 2D mode; the 3D scene is viz-3d (change 15).
 */
export function Viz2D({ rooms, module: m }: Viz2DProps) {
  const { t } = useI18n();
  const valid = rooms.filter(isRoomValid);
  if (valid.length === 0) return null;

  // Shared scale: the largest single dimension across all rooms maps to TARGET units.
  const maxDim = Math.max(...valid.map((r) => Math.max(r.length, r.width)));
  const scale = TARGET / (maxDim || 1);

  return (
    <section className="space-y-3 rounded-xl border border-line bg-panel p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-sm font-semibold">
          {t('visualizer')} <span className="font-mono text-xs text-muted">2D</span>
        </h3>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
          <span aria-hidden="true" className="inline-block h-3 w-3 rounded-sm bg-accent opacity-85" />
          {t('oneModule')}
        </span>
      </div>
      <p className="text-[11px] text-faint">{t('vizNote')}</p>

      <div className="flex flex-wrap items-end gap-6">
        {valid.map((room) => (
          <RoomPlan key={room.id} room={room} m={m} scale={scale} />
        ))}
      </div>
    </section>
  );
}

function RoomPlan({ room, m, scale }: { room: Room; m: number; scale: number }) {
  const { cols, rows, rightStrip, bottomStrip, highlight } = layoutRoom2D(room.length, room.width, m);
  const w = Math.round(room.length * scale);
  const h = Math.round(room.width * scale);
  const step = m * scale;
  const vbW = w + PAD * 2;
  const vbH = h + PAD * 2;
  const cell = Math.min(step, w, h);

  const vLines = Array.from({ length: cols }, (_, i) => PAD + Math.round((i + 1) * step)).filter(
    (x) => x < PAD + w,
  );
  const hLines = Array.from({ length: rows }, (_, i) => PAD + Math.round((i + 1) * step)).filter(
    (y) => y < PAD + h,
  );

  return (
    <figure className="m-0 flex flex-col gap-1.5">
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-auto w-full max-w-[220px] overflow-visible"
        role="img"
        aria-label={`${room.name} ${room.length} × ${room.width}`}
      >
        {/* Room rectangle to scale. */}
        <rect x={PAD} y={PAD} width={w} height={h} fill="var(--inset)" stroke="var(--line2)" strokeWidth={1.2} />

        {/* Faint M×M grid (FR-VIZ2D-02). */}
        {vLines.map((x) => (
          <line key={`v${x}`} x1={x} y1={PAD} x2={x} y2={PAD + h} stroke="var(--line)" strokeWidth={0.75} />
        ))}
        {hLines.map((y) => (
          <line key={`h${y}`} x1={PAD} y1={y} x2={PAD + w} y2={y} stroke="var(--line)" strokeWidth={0.75} />
        ))}

        {/* Signed-remainder strips on the far edges (FR-VIZ2D-02). */}
        {rightStrip > 0 && (
          <rect x={PAD + Math.round(cols * step)} y={PAD} width={Math.max(0, w - Math.round(cols * step))} height={h} fill="var(--warn-bg)" />
        )}
        {bottomStrip > 0 && (
          <rect x={PAD} y={PAD + Math.round(rows * step)} width={w} height={Math.max(0, h - Math.round(rows * step))} fill="var(--warn-bg)" />
        )}

        {/* Exactly one highlighted module cell (FR-VIZ2D-03), bottom-left, cellpulse (FR-VIZ2D-04). */}
        <rect
          x={PAD + Math.round(highlight.col * step)}
          y={PAD + Math.round(highlight.row * step)}
          width={cell}
          height={cell}
          fill="var(--accent)"
          opacity={0.85}
          className="[animation:cellpulse_2.6s_ease-in-out_infinite]"
        />
      </svg>
      <figcaption className="text-[11px] text-fg2">
        {room.name}{' '}
        <span className="font-mono text-muted">
          · {room.length} × {room.width} · {cols}×{rows}
        </span>
      </figcaption>
    </figure>
  );
}
