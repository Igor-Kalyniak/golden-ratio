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

/**
 * Locale-independent band-name key; the UI maps it via `t()` so the engine stays
 * language-agnostic (FR-VERT-06, same pattern as `WalkwayRecommendationKey`).
 */
export type BandNameKey =
  | 'band.basePlinth'
  | 'band.workZone'
  | 'band.doorHead'
  | 'band.upperCeiling';

export interface BandLayoutRow {
  /** 0-based index, bottom-to-top. */
  index: number;
  /** Lower edge in mm. */
  from: number;
  /** Upper edge in mm. */
  to: number;
  /** `to − from` in mm. */
  span: number;
  /** Locale-independent name key. */
  nameKey: BandNameKey;
  /** True for the trailing leftover band (`topRemainder > 0`). */
  partial: boolean;
  /** Alternating-fill flag (odd index) for the renderer. */
  alt: boolean;
}

export interface BandMark {
  /** Mark height in mm (0…ceiling). */
  mm: number;
  /** True when the label is condensed away at high band counts (FR-VERT-06). */
  condensedOut: boolean;
}

export interface BandDiagramLayout {
  /** Bands bottom-to-top; the partial band (if any) is last. */
  bands: BandLayoutRow[];
  /** mm marks `0…ceiling`; `condensedOut` hides the label when dense. */
  marks: BandMark[];
  /** Opening overlay at its true height, or null when no opening. */
  opening: { mm: number; aligned: boolean } | null;
  /** True when the mark count exceeds the density threshold (16). */
  condensed: boolean;
}

/** Mark-label density threshold — above this, labels are condensed (FR-VERT-06). */
export const BAND_MARK_DENSITY = 16;

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
  /** Signed nearest-distance remainder (positive ⇒ over grid, round down; negative ⇒ under grid, round up — FR-GRID-03). */
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
// Module suggestion — FR-MODULE-01, FR-MODULE2D-01, ADR-0002
// ---------------------------------------------------------------------------

/** Room length × width (mm) — a structural subset of `Room`, so the engine stays app-state-free. */
export interface RoomDimensions {
  length: number;
  width: number;
}

/**
 * Build a `ModuleSuggestion` from a raw GCD: snap to the nearest standard module, surface the
 * residual (always, so a poor snap is visible — ADR-0002), and offer the two nearest alternatives.
 * Shared by the 3D (`suggestModule`) and 2D (`suggestModule2D`) paths so they cannot drift.
 */
function suggestionFromGcd(rawGcd: number): ModuleSuggestion {
  const suggested = nearestStandardModule(rawGcd);
  const residual = Math.abs(rawGcd - suggested);
  const alternatives = STANDARD_MODULES.filter((m) => m !== suggested)
    .sort((a, b) => Math.abs(a - rawGcd) - Math.abs(b - rawGcd))
    .slice(0, 2);
  return { rawGcd, suggested, alternatives, residual };
}

/**
 * Suggest a module from ceiling & opening heights (3D mode) — FR-MODULE-01.
 * `residual` is always returned so a poor snap is visible, never silent.
 */
export function suggestModule(ceiling: number, opening: number): ModuleSuggestion {
  return suggestionFromGcd(gcd(ceiling, opening));
}

/**
 * Suggest a module from room dimensions (2D mode) — FR-MODULE2D-01. `rawGcd` is the GCD folded
 * across every room's length and width (a single room → `gcd(length, width)`); the result is
 * snapped to the nearest standard module with the residual surfaced. The caller passes the valid
 * rooms; an empty list folds to `rawGcd = 0` (snaps to the smallest standard module).
 */
export function suggestModule2D(rooms: readonly RoomDimensions[]): ModuleSuggestion {
  const rawGcd = rooms.reduce((acc, room) => gcd(gcd(acc, room.length), room.width), 0);
  return suggestionFromGcd(rawGcd);
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
 *
 * Note: with the current `STANDARD_MODULES` (100…700) a *valid selection* never trips
 * either bound, so the banner is dormant-by-data — NOT dead code. It is the FR-MODULE-05
 * spec contract, tested at its boundaries, and becomes live with zero code change if
 * `STANDARD_MODULES` gains an out-of-range value (ADR-0002 / OQ-01).
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

/**
 * Render-ready band layout (FR-VERT-02/03/04/06) built from `computeVerticalBands`.
 * All values are in mm space (0…ceiling); the SVG maps mm → y with a single viewBox
 * scale, so this stays resolution-independent and unit-testable. Band names are
 * locale-independent keys the UI resolves via `t()`.
 */
export function layoutBandDiagram(ceiling: number, m: number, opening?: number): BandDiagramLayout {
  const { bands: fullBands, topRemainder } = computeVerticalBands(ceiling, m, opening);
  const hasPartial = topRemainder > 0;
  const totalRows = fullBands + (hasPartial ? 1 : 0);

  const bands: BandLayoutRow[] = [];
  for (let i = 0; i < totalRows; i++) {
    const partial = hasPartial && i === totalRows - 1;
    const from = i * m;
    const to = partial ? ceiling : (i + 1) * m;
    bands.push({
      index: i,
      from,
      to,
      span: to - from,
      nameKey: bandNameKey(i, totalRows, partial, opening, m),
      partial,
      alt: i % 2 === 1,
    });
  }

  // Marks at every band boundary plus the ceiling; condense labels when dense.
  const markVals: number[] = [];
  for (let i = 0; i <= fullBands; i++) markVals.push(i * m);
  if (hasPartial) markVals.push(ceiling);
  const condensed = markVals.length > BAND_MARK_DENSITY;
  const marks: BandMark[] = markVals.map((mm, i) => ({
    mm,
    // Keep every 4th mark and the last; hide the rest only when dense.
    condensedOut: condensed && i % 4 !== 0 && i !== markVals.length - 1,
  }));

  const overlay =
    opening !== undefined ? { mm: opening, aligned: opening % m === 0 } : null;

  return { bands, marks, opening: overlay, condensed };
}

/** Band-name key for band `i` of `total` (3D-mode rule from the frozen prototype). */
function bandNameKey(
  i: number,
  total: number,
  partial: boolean,
  opening: number | undefined,
  m: number,
): BandNameKey {
  if (i === 0) return 'band.basePlinth';
  if (partial || i === total - 1) return 'band.upperCeiling';
  if (opening !== undefined && i * m < opening && (i + 1) * m >= opening) {
    return 'band.doorHead';
  }
  return 'band.workZone';
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

/** The wall the golden split is applied to: the longer of a room's two dimensions (FR-GOLD-03). */
export function longerWall(room: { length: number; width: number }): number {
  return Math.max(room.length, room.width);
}

/**
 * A golden snap is an "approximate fit" when its offset exceeds a quarter module
 * (`m / 4`); at or below ¼M it reads "clean fit" (FR-GOLD-04).
 */
export function isApproximateFit(snapOffset: number, m: number): boolean {
  return snapOffset > m / 4;
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

/**
 * The direction to round a dimension to reach the grid, from its signed remainder (FR-GRID-03):
 * a positive remainder sits over the grid line (`'roundDown'`), a negative one under it
 * (`'roundUp'`), and zero needs no rounding (`null`). Locale-independent key the UI maps via `t()`.
 */
export function gridRoundDirection(remainder: number): 'roundDown' | 'roundUp' | null {
  if (remainder > 0) return 'roundDown';
  if (remainder < 0) return 'roundUp';
  return null;
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

/**
 * Filled-bar count for the walkway rating meter (FR-WALK-04): comfortable = 3, acceptable = 2,
 * tight = 1. One tested definition shared by the UI so the meter can't drift from the rating.
 */
export function walkwayMeterBars(rating: WalkwayRating): 1 | 2 | 3 {
  if (rating === 'comfortable') return 3;
  if (rating === 'acceptable') return 2;
  return 1;
}

// ---------------------------------------------------------------------------
// 2D visualizer geometry — FR-VIZ2D-01/02/03
// ---------------------------------------------------------------------------

export interface Room2DLayout {
  /** Whole module cells that fit along the length: floor(length / m). */
  cols: number;
  /** Whole module cells that fit along the width: floor(width / m). */
  rows: number;
  /** Leftover length past the last whole column (mm); 0 when length divides evenly. */
  rightStrip: number;
  /** Leftover width past the last whole row (mm); 0 when width divides evenly. */
  bottomStrip: number;
  /** The single highlighted M×M cell, bottom-left (0-based col/row). */
  highlight: { col: number; row: number };
}

/**
 * Render-ready 2D-visualizer grid layout for a room (FR-VIZ2D-02/03), in module/mm space —
 * the component multiplies by one shared mm→viewBox scale. Tiles `floor(dim/m)` WHOLE cells
 * (the modules that physically fit inside the rectangle) with the leftover surfaced as an edge
 * strip; this "fit-inside" count is intentionally distinct from `computeRoomGrid`'s nearest
 * (`round`) count used for the grid-fit quality result. Exactly one cell is highlighted.
 */
export function layoutRoom2D(length: number, width: number, m: number): Room2DLayout {
  const cols = Math.floor(length / m);
  const rows = Math.floor(width / m);
  return {
    cols,
    rows,
    rightStrip: length - cols * m,
    bottomStrip: width - rows * m,
    highlight: { col: 0, row: Math.max(0, rows - 1) },
  };
}

// ---------------------------------------------------------------------------
// 3D visualizer geometry — FR-VIZ3D-01/02/03
// ---------------------------------------------------------------------------

export interface Room3DLayout {
  /** Box extents in mm: length (x), width (z/depth), ceiling height (y). */
  l: number;
  w: number;
  h: number;
  /** Whole module cells along each axis: floor(dim / m). */
  cols: number;
  rows: number;
  layers: number;
  /**
   * Signed grid remainder per axis (mm): `dim − floor(dim/m)·m`, i.e. the leftover past the last
   * whole module. The 3D analogue of `layoutRoom2D`'s `rightStrip`/`bottomStrip`, rendered as thin
   * partial slabs on the far faces (FR-VIZ3D-07). 0 when the dimension divides evenly by m.
   */
  lengthRemainder: number;
  widthRemainder: number;
  heightRemainder: number;
  /** Origin (mm, room-corner-relative) of the single highlighted M³ cube. */
  cube: { x: number; y: number; z: number };
  /** Opening band height (mm) on a wall face, or null when omitted / above the ceiling. */
  openingY: number | null;
}

/**
 * Render-ready 3D-visualizer box geometry for a room (FR-VIZ3D-01/02/03), in module/mm space —
 * the component maps it to Three.js units with one shared scale. The box is length × width ×
 * ceiling; `cols/rows/layers` are the whole modules that fit along each axis; exactly one M³ cube
 * is highlighted at the box's bottom-front-left corner; `openingY` is the opening height on a wall
 * face, or null when no opening is given or it exceeds the ceiling (FR-VIZ3D-02 "omitted when
 * blank"). `lengthRemainder`/`widthRemainder`/`heightRemainder` carry the leftover past the last
 * whole module per axis so the lattice's far-face partial slabs are a data fact (FR-VIZ3D-07).
 * Framework-free — no R3F/three import (NFR-BUNDLE-01: the 2D path stays 3D-free).
 */
export function layoutRoom3D(
  length: number,
  width: number,
  ceiling: number,
  m: number,
  opening?: number,
): Room3DLayout {
  const openingValid = opening !== undefined && opening > 0 && opening <= ceiling;
  const cols = Math.floor(length / m);
  const rows = Math.floor(width / m);
  const layers = Math.floor(ceiling / m);
  return {
    l: length,
    w: width,
    h: ceiling,
    cols,
    rows,
    layers,
    lengthRemainder: length - cols * m,
    widthRemainder: width - rows * m,
    heightRemainder: ceiling - layers * m,
    cube: { x: 0, y: 0, z: 0 },
    openingY: openingValid ? opening : null,
  };
}
