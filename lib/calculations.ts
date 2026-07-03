/**
 * Apartment Module & Golden Ratio Calculator — pure proportioning math.
 *
 * Framework-free: no `next/*`, no `react`, no DOM globals (NFR-PURE-01). Every
 * export is a deterministic, synchronous pure function over numbers and plain
 * objects, so the whole module is 100% unit-testable (NFR-TEST-01) and cheap to
 * recompute (NFR-PERF-01/02).
 *
 * Canonical algorithms: docs/DESIGN.md §10, §12–13 (the `calculation-logic`
 * skill). Requirement IDs are cited per function.
 */

import { CALC_LABELS, type CalcLabel } from './i18n.ts';

// ---------------------------------------------------------------------------
// Constants (ADR-0002: STANDARD_MODULES is one swappable constant; residual
// is always surfaced). Provisional v1 values — OQ-01 stays open with the SME.
// ---------------------------------------------------------------------------

/** The one source of truth for module snapping. Only `nearestStandardModule` reads it. */
export const STANDARD_MODULES = [100, 150, 200, 300, 350, 600, 700] as const;

/** Inclusive integer validation bounds (mm). */
export const BOUNDS = {
  ceiling: { min: 2000, max: 5000 },
  /** opening max is the current ceiling; see `isValidOpening`. */
  opening: { min: 1800 },
  dimension: { min: 500, max: 15000 },
} as const;

/** Impractical-module warning thresholds (mm) — FR-MODULE-05 consumers. */
export const MODULE_WARNING = { large: 1000, small: 100 } as const;

/**
 * Module-ruler multipliers, index-aligned to `CALC_LABELS` (¼M…4M) — FR-MODULE-04.
 * Kept beside the labels' single source of truth so `computeModuleRuler` zips them.
 */
export const RULER_FACTORS = [0.25, 0.5, 1, 1.5, 2, 3, 4] as const;

/** Standard furniture depths (mm). The 1200 "facing units" row extends the brief's pair. */
export const FURNITURE_DEPTHS = { wardrobeKitchen: 600, sofa: 900, facingUnits: 1200 } as const;

/** Fixed ergonomic walkway thresholds (mm) — BC-WALK-01: never scale with M. */
export const WALKWAY_THRESHOLDS = { comfortable: 900, acceptable: 600 } as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GridQuality = 'exact' | 'close' | 'poor';
export type WalkwayRating = 'comfortable' | 'acceptable' | 'tight';
/** Locale-independent i18n key for the walkway guidance sentence; the UI maps it via `t()`. */
export type WalkwayRecommendationKey =
  | 'walkway.comfortable'
  | 'walkway.acceptable'
  | 'walkway.tight';

/** Non-null result of `moduleWarning` — the active module is out of practical range. */
export type ModuleWarning = 'large' | 'small';

export interface ModuleRulerRow {
  /** Fixed, never-translated label (`¼M`…`4M`) — FR-MODULE-04, FR-I18N-03. */
  label: CalcLabel;
  /** The multiplier applied to the module. */
  k: number;
  /** `round(module × k)` in mm. */
  size: number;
}

export interface ModuleSuggestion {
  /** Raw GCD of the source dimensions. */
  rawGcd: number;
  /** `rawGcd` snapped to the nearest STANDARD_MODULES value. */
  suggested: number;
  /** The two nearest other standard-module values. */
  alternatives: number[];
  /** Distance |rawGcd − suggested|; always computed so a poor snap is visible. */
  residual: number;
}

export interface VerticalBands {
  /** Count of full module bands: floor(ceiling / m). */
  bands: number;
  /** Leftover height above the last full band: ceiling − bands·m. */
  topRemainder: number;
  /** True only when the opening lands on a band boundary. */
  openingAligned: boolean;
  /** The band index the opening falls in (1-based), or null when no opening. */
  openingBand: number | null;
}

export interface GoldenSplit {
  /** Exact larger segment: length × 0.618. */
  larger: number;
  /** Exact smaller segment: length × 0.382. */
  smaller: number;
  /** `larger` snapped to the nearest ½M grid line. */
  largerSnapped: number;
  /** Remainder of the wall after the snapped larger segment. */
  smallerSnapped: number;
  /** Distance |larger − largerSnapped|; > ¼M ⇒ "approximate fit". */
  snapOffset: number;
}

export interface RoomGrid {
  lengthModules: number;
  widthModules: number;
  /** Signed nearest-distance remainder (negative ⇒ round down, positive ⇒ round up). */
  lengthRemainder: number;
  widthRemainder: number;
  quality: GridQuality;
}

export interface Walkway {
  /** roomWidth − furnitureDepth − (oppositeDepth ?? 0). */
  available: number;
  rating: WalkwayRating;
  /**
   * Locale-independent i18n key for the guidance sentence (never code compliance).
   * The pure engine stays language-agnostic (NFR-PURE-01); the UI localizes via `t()`.
   */
  recommendation: WalkwayRecommendationKey;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Integer, absolute-valued GCD. */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

/** The only reader of STANDARD_MODULES — snaps `v` to the nearest standard value. */
export function nearestStandardModule(v: number): number {
  return STANDARD_MODULES.reduce(
    (prev, cur) => (Math.abs(cur - v) < Math.abs(prev - v) ? cur : prev),
    STANDARD_MODULES[0],
  );
}

/** Round `value` to the nearest multiple of `step`. */
export function snap(value: number, step: number): number {
  return Math.round(value / step) * step;
}

// ---------------------------------------------------------------------------
// Validation (FR-APT-01/02, FR-ROOM-03 bounds; consumed by input capabilities)
// ---------------------------------------------------------------------------

export function isValidCeiling(ceiling: number): boolean {
  return Number.isInteger(ceiling) && ceiling >= BOUNDS.ceiling.min && ceiling <= BOUNDS.ceiling.max;
}

export function isValidOpening(opening: number, ceiling: number): boolean {
  return Number.isInteger(opening) && opening >= BOUNDS.opening.min && opening <= ceiling;
}

export function isValidDimension(dim: number): boolean {
  return Number.isInteger(dim) && dim >= BOUNDS.dimension.min && dim <= BOUNDS.dimension.max;
}

// ---------------------------------------------------------------------------
// Module suggestion — FR-MODULE-01, ADR-0002
// ---------------------------------------------------------------------------

/**
 * Suggest a module from ceiling & opening heights.
 * `residual` is always returned so a poor snap is visible, never silent.
 */
export function suggestModule(ceiling: number, opening: number): ModuleSuggestion {
  const rawGcd = gcd(ceiling, opening);
  const suggested = nearestStandardModule(rawGcd);
  const residual = Math.abs(rawGcd - suggested);
  const alternatives = STANDARD_MODULES.filter((m) => m !== suggested)
    .sort((a, b) => Math.abs(a - rawGcd) - Math.abs(b - rawGcd))
    .slice(0, 2);
  return { rawGcd, suggested, alternatives, residual };
}

// ---------------------------------------------------------------------------
// Module ruler & warning — FR-MODULE-04/05
// ---------------------------------------------------------------------------

/**
 * The ¼M…4M ruler rows for a module `m`: each `size` is `round(m·k)` (FR-MODULE-04).
 * Labels come from `CALC_LABELS` (never translated); the UI localizes the "typical use"
 * prose by keying off the label, so the engine stays language-agnostic (NFR-PURE-01).
 */
export function computeModuleRuler(m: number): ModuleRulerRow[] {
  return RULER_FACTORS.map((k, i) => ({
    label: CALC_LABELS[i],
    k,
    size: Math.round(m * k),
  }));
}

/**
 * Classify a module against the practical range (FR-MODULE-05): `'large'` when
 * `m > MODULE_WARNING.large` (1000), `'small'` when `m < MODULE_WARNING.small` (100),
 * else `null`. The calculation always proceeds; this only drives the warning banner.
 */
export function moduleWarning(m: number): ModuleWarning | null {
  if (m > MODULE_WARNING.large) return 'large';
  if (m < MODULE_WARNING.small) return 'small';
  return null;
}

// ---------------------------------------------------------------------------
// Vertical bands — FR-VERT-01/02/03/04
// ---------------------------------------------------------------------------

/**
 * Derive height bands for a ceiling given module `m`.
 * Band count is `floor(ceiling / m)`; the leftover is `topRemainder`.
 */
export function computeVerticalBands(ceiling: number, m: number, opening?: number): VerticalBands {
  const bands = Math.floor(ceiling / m);
  const topRemainder = ceiling - bands * m;
  let openingAligned = false;
  let openingBand: number | null = null;
  if (opening !== undefined) {
    openingAligned = opening % m === 0;
    openingBand = Math.ceil(opening / m);
  }
  return { bands, topRemainder, openingAligned, openingBand };
}

// ---------------------------------------------------------------------------
// Golden split — FR-GOLD-01/02/03
// ---------------------------------------------------------------------------

/**
 * Golden-ratio split of a wall of `length`, snapped to the ½M grid.
 * The caller applies this to the longer wall of a room.
 */
export function computeGoldenSplit(length: number, m: number): GoldenSplit {
  const larger = length * 0.618;
  const smaller = length * 0.382;
  const largerSnapped = snap(larger, m / 2);
  const smallerSnapped = length - largerSnapped;
  const snapOffset = Math.abs(larger - largerSnapped);
  return { larger, smaller, largerSnapped, smallerSnapped, snapOffset };
}

// ---------------------------------------------------------------------------
// Room grid fit — FR-GRID-01/02/03/04
// ---------------------------------------------------------------------------

/**
 * Fit a room's length × width to the module grid.
 * Remainders are signed nearest-distances so a 1 mm-short dimension reads
 * `close`, not `poor` (FR-GRID-03/04).
 */
export function computeRoomGrid(length: number, width: number, m: number): RoomGrid {
  const lengthModules = Math.round(length / m);
  const widthModules = Math.round(width / m);
  const lengthRemainder = length - lengthModules * m;
  const widthRemainder = width - widthModules * m;
  const maxAbs = Math.max(Math.abs(lengthRemainder), Math.abs(widthRemainder));
  let quality: GridQuality;
  if (maxAbs === 0) {
    quality = 'exact';
  } else if (maxAbs <= m / 4) {
    quality = 'close';
  } else {
    quality = 'poor';
  }
  return { lengthModules, widthModules, lengthRemainder, widthRemainder, quality };
}

// ---------------------------------------------------------------------------
// Walkway clearance — FR-WALK-01/02/03, BC-WALK-01
// ---------------------------------------------------------------------------

/** Rate a clearance against the fixed ergonomic thresholds. */
export function rateWalkway(available: number): WalkwayRating {
  if (available >= WALKWAY_THRESHOLDS.comfortable) return 'comfortable';
  if (available >= WALKWAY_THRESHOLDS.acceptable) return 'acceptable';
  return 'tight';
}

/**
 * Estimate a walkway clearance. Ratings use fixed mm thresholds decoupled from
 * the module M — walkway comfort is an absolute human dimension (BC-WALK-01).
 */
export function computeWalkways(
  roomWidth: number,
  furnitureDepth: number,
  oppositeDepth?: number,
): Walkway {
  const available = roomWidth - furnitureDepth - (oppositeDepth ?? 0);
  const rating = rateWalkway(available);
  const recommendation: WalkwayRecommendationKey = `walkway.${rating}`;
  return { available, rating, recommendation };
}
