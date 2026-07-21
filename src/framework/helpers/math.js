/** Small, dependency-free numeric helpers used across animations. */

export const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export const lerp = (from, to, t) => from + (to - from) * t;

/** Deterministic pseudo-random in 0..1 — renders must be reproducible. */
export const seededRandom = (seed) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Rounds to `precision` decimals — keeps generated CSS strings short. */
export const round = (value, precision = 3) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};
