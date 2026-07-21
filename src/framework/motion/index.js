/**
 * Motion tokens — the timing half of the design system, and part of the
 * framework core (Ring 1).
 *
 * These are STATIC by design: the pure `animations/` functions import them
 * directly and must never call a React hook, so motion timing cannot come from
 * a runtime ThemeProvider. A brand that wants different timing overrides these
 * per call (presets already accept `duration`/`easing`) or ships its own preset
 * pack — the visual theme (colours/type/etc.) is what flows through `useTheme`.
 *
 * Philosophy: things enter decisively and settle gently. Nothing bounces unless
 * it is a physical object. Exits are always faster than entrances, because the
 * viewer has already read the content.
 *
 * Durations are expressed in FRAMES at the project frame rate (30). Use
 * `helpers/frames.js` for anything that must be frame-rate independent.
 */

/** Cubic-bezier control points, consumable by Remotion's `Easing.bezier`. */
export const curves = {
  /** Default. Fast out, long elegant settle — the Apple/Linear feel. */
  standard: [0.22, 1, 0.36, 1],
  /** Content entering the frame. */
  entrance: [0.16, 1, 0.3, 1],
  /** Content leaving the frame — no overshoot, get out of the way. */
  exit: [0.4, 0, 1, 1],
  /** Symmetric, for camera moves and continuous drifts. */
  smooth: [0.45, 0, 0.55, 1],
  /** Slight anticipation, for emphasis beats only. */
  emphasized: [0.34, 1.28, 0.42, 1],
  /** Mechanical/linear — parallax, loops, noise. */
  linear: [0, 0, 1, 1],
};

/** Spring configs. Damping stays high — premium motion does not wobble. */
export const springs = {
  /** General purpose entrance. Settles in ~0.7s, no visible overshoot. */
  gentle: { damping: 200, stiffness: 120, mass: 0.6 },
  /** Snappier, for small UI elements and badges. */
  snappy: { damping: 26, stiffness: 220, mass: 0.5 },
  /** For physical objects — one soft bounce. */
  physical: { damping: 16, stiffness: 140, mass: 0.8 },
  /** Slow, cinematic reveal of large elements. */
  cinematic: { damping: 200, stiffness: 60, mass: 1 },
};

/** Frames @ 30fps. */
export const durations = {
  instant: 6, // 0.20s
  fast: 12, // 0.40s
  base: 20, // 0.67s — default entrance
  slow: 30, // 1.00s
  slower: 45, // 1.50s
  cinematic: 75, // 2.50s — hero reveals, camera pushes
};

/** Frames to wait between items in a staggered group. */
export const stagger = {
  tight: 2,
  base: 4,
  loose: 7,
  dramatic: 12,
};

/** How long a scene holds after its content has fully landed. */
export const beats = {
  short: 30, // 1s
  base: 60, // 2s
  long: 105, // 3.5s
};

/** Default travel distances (px @ 1080p) for slide/reveal animations. */
export const distances = {
  xs: 12,
  sm: 28,
  md: 56,
  lg: 110,
  xl: 220,
};

/** Continuous ambient motion — floats, drifts, breathing scale. */
export const ambient = {
  floatAmplitude: 14,
  floatPeriod: 150, // frames per full cycle (5s)
  driftAmplitude: 26,
  driftPeriod: 300,
  breathScale: 0.02,
};

/** Camera language: how much we push/pull over a scene. */
export const camera = {
  pushScale: 0.06, // 1.00 -> 1.06 across a scene
  pullScale: -0.05,
  panDistance: 60,
  parallaxDepths: { back: 0.15, mid: 0.4, front: 0.85 },
};

/** Cross-scene transition lengths (frames). Consumed by the transition registry. */
export const transitions = {
  cut: 0,
  quick: 12,
  base: 20,
  slow: 34,
};

export const motion = {
  curves,
  springs,
  durations,
  stagger,
  beats,
  distances,
  ambient,
  camera,
  transitions,
};

export default motion;
