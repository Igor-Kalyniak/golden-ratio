/**
 * Golden-ratio brand mark (DESIGN §7, FR-LOGO-01): nested φ:1 rectangles with a golden-spiral arc
 * sweeping through them. Single color via `currentColor` — inherits the header's accent and
 * inverts in dark mode — on a transparent ground, pure SVG (no raster, no dependency), readable
 * down to favicon size. `aria-hidden`: the adjacent title is the accessible name.
 *
 * Server Component — pure markup, no interactivity, so no `'use client'` boundary.
 */
export function Logo({
  width = 40,
  height = 26,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 110 70"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect x="1" y="1" width="108" height="68" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <line x1="68" y1="1" x2="68" y2="69" stroke="currentColor" strokeWidth="1.1" opacity=".55" />
      <line x1="68" y1="43" x2="110" y2="43" stroke="currentColor" strokeWidth="1.1" opacity=".55" />
      <line x1="93" y1="43" x2="93" y2="69" stroke="currentColor" strokeWidth="1.1" opacity=".4" />
      <line x1="68" y1="59" x2="93" y2="59" stroke="currentColor" strokeWidth="1.1" opacity=".4" />
      <path d="M1 1 A67 67 0 0 1 68 69" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <path d="M68 69 A42 42 0 0 1 110 43" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <path
        d="M110 43 A26 26 0 0 1 93 69"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        opacity=".8"
      />
    </svg>
  );
}
