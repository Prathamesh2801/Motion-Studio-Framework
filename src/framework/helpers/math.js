/** Small, dependency-free numeric helpers used across animations. */

export const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export const lerp = (from, to, t) => from + (to - from) * t;

/** Remaps `value` from one range to another, clamped by default. */
export const mapRange = (value, [inMin, inMax], [outMin, outMax], shouldClamp = true) => {
  const t = inMax === inMin ? 0 : (value - inMin) / (inMax - inMin);
  const progress = shouldClamp ? clamp(t) : t;
  return lerp(outMin, outMax, progress);
};

/** 0..1 progress through a window, used by every entrance helper. */
export const progressIn = (frame, start, duration) =>
  duration <= 0 ? 1 : clamp((frame - start) / duration);

/** Deterministic pseudo-random in 0..1 — renders must be reproducible. */
export const seededRandom = (seed) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const degToRad = (deg) => (deg * Math.PI) / 180;

/** Rounds to `precision` decimals — keeps generated CSS strings short. */
export const round = (value, precision = 3) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};
