/**
 * Output formats + structural responsive tokens (framework core, Ring 1).
 *
 * Every composition picks a format from here so dimensions and frame rate are
 * never invented per video. Formats carry a `bucket` — one of four responsive
 * shapes (`landscape | portrait | square | ultrawide`) — which `useResponsive`
 * and the layout system branch on. This is a deliberate widening of the
 * reference project's 3-way (portrait/square/landscape) split, which silently
 * mis-bucketed 32:9 as landscape.
 *
 * `layout` (gutters, safe areas) and `zIndex` live here rather than in the
 * brand theme because they are STRUCTURAL: `useFormat`/`Scene` depend on them
 * and must stay independent of whichever brand theme is active.
 */

export const FPS = 30;

/** Reference canvas the design system's px values were authored against. */
export const DESIGN_WIDTH = 1920;
export const DESIGN_HEIGHT = 1080;

/**
 * `scale` multiplies every design-system px value for that format, so type and
 * spacing authored at 1920x1080 stay optically correct on a vertical phone
 * frame or a 4K panel. `social` reserves room for platform UI.
 *
 * Vertical scales are deliberately close to 1.0 rather than tracking the width
 * ratio (1080/1920 = 0.56). A phone shows a 1080px-wide video in ~400 physical
 * pixels, so type scaled down by width becomes unreadable in the feed — social
 * formats need type LARGER relative to the frame, not smaller.
 */
export const FORMATS = {
  landscape: {
    id: 'landscape',
    bucket: 'landscape',
    width: 1920,
    height: 1080,
    fps: FPS,
    scale: 1,
    social: false,
    label: '16:9 — YouTube / Web',
  },
  reel: {
    id: 'reel',
    bucket: 'portrait',
    width: 1080,
    height: 1920,
    fps: FPS,
    scale: 0.95,
    social: true,
    label: '9:16 — Reels / Shorts / TikTok',
  },
  square: {
    id: 'square',
    bucket: 'square',
    width: 1080,
    height: 1080,
    fps: FPS,
    scale: 0.88,
    social: true,
    label: '1:1 — Feed post',
  },
  exhibition: {
    id: 'exhibition',
    bucket: 'portrait',
    width: 2160,
    height: 3840,
    fps: FPS,
    // Exactly 2x `reel` (1080x1920 -> 2160x3840) at the same 9:16 aspect, so the
    // scale is 2x reel's: 0.95 * 2 = 1.9. It was 1.24 until Phase 5, which was a
    // guess made when the format was defined and never rendered — it made type
    // ~35% smaller relative to the frame than the identically-shaped `reel`,
    // even though both are the same bucket showing the same composition.
    // Two formats of the same aspect must be the same design at different
    // resolutions, or "format-independent" is not true.
    scale: 1.9,
    social: false,
    label: '9:16 4K — Exhibition screen',
  },
  ultrawide: {
    id: 'ultrawide',
    bucket: 'ultrawide',
    width: 3840,
    height: 1080,
    fps: FPS,
    // Above 1.0 on purpose, unlike exhibition's fix above. This shares its 1080
    // height with `landscape`, so 1.0 would reproduce landscape's type size —
    // but a booth banner is read from several metres away, and the format has
    // width to spare and little vertical room. Larger type, fewer words.
    scale: 1.4,
    social: false,
    label: '32:9 — Booth banner',
  },
};

/** Look up a format token by its exact dimensions; falls back to landscape. */
export const formatFor = (width, height) =>
  Object.values(FORMATS).find((f) => f.width === width && f.height === height) ??
  FORMATS.landscape;

/**
 * The responsive bucket for any canvas, derived from aspect ratio so it works
 * for unregistered/custom sizes too — not only the named `FORMATS`.
 *
 *   ultrawide : aspect >= 2.2   (32:9 booth banners, panoramas)
 *   landscape : 1.05 < aspect < 2.2
 *   square    : 0.95 <= aspect <= 1.05
 *   portrait  : aspect < 0.95
 */
export const bucketFor = (width, height) => {
  const aspect = width / height;
  if (aspect >= 2.2) return 'ultrawide';
  if (aspect > 1.05) return 'landscape';
  if (aspect >= 0.95) return 'square';
  return 'portrait';
};

/** Common video lengths in seconds, for planning composition durations. */
export const RUNTIMES = {
  bumper: 6,
  reel: 20,
  promo: 30,
  showcase: 45,
  launch: 60,
  companyIntro: 90,
};

/**
 * Safe margins (px @ 1920x1080). Cinematic framing keeps content well off the
 * edge; social formats additionally reserve room for platform UI. Structural,
 * not brand — hence here rather than in the theme.
 */
export const layout = {
  gutter: 128, // horizontal padding for 16:9
  gutterCompact: 72, // horizontal padding for 9:16 / 1:1
  maxContentWidth: 1400,
  columnGap: 48,
  rowGap: 32,
  socialSafeTop: 160,
  socialSafeBottom: 224,
};

/** Named z-layers, so stacking order is never guessed. */
export const zIndex = {
  background: 0,
  gradient: 10,
  media: 20,
  glow: 30,
  content: 40,
  overlay: 50,
  grain: 60,
};

// NOTE: a `VIDEO` aggregate re-bundling FPS/FORMATS/RUNTIMES/DESIGN_* used to be
// exported here. Removed in Phase 5 — every member is already exported
// individually, and two names for one thing is a question ("which do I import?")
// with no right answer.
