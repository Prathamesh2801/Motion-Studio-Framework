import { animate, oscillate } from '../animations/core.js';
import { camera as cameraTokens, ambient } from '../motion/index.js';
import { transform } from '../helpers/style.js';
import { seededRandom } from '../helpers/math.js';
import { createRegistry } from '../helpers/registry.js';

/**
 * Camera language (Ring 1).
 *
 * Pure `(ctx) => style` functions plus a NAMED registry, so `Scene`/templates
 * pick a camera move by string the same way they pick an entrance preset. A
 * scene should almost always carry *some* continuous movement — a 6% push over
 * 5 seconds is invisible frame-to-frame but makes the shot feel alive.
 *
 * Camera moves compose via `mergeMotion` like any other animation. Registry
 * entries receive `{ frame, duration, fps, ... }`; `duration` is normally the
 * scene length from `useSceneProgress`.
 */

/** Slow push-in (or pull-out with a negative `amount`) across a duration. */
export const cameraPush = ({
  frame,
  duration,
  amount = cameraTokens.pushScale,
  easing = 'smooth',
  origin = 'center',
}) => ({
  transform: transform({
    scale: animate({ frame, from: 1, to: 1 + amount, delay: 0, duration, easing }),
  }),
  transformOrigin: origin,
});

export const cameraPull = (options) =>
  cameraPush({ ...options, amount: options.amount ?? cameraTokens.pullScale });

/** Lateral drift, usually paired with a push for a dolly feel. */
export const cameraPan = ({
  frame,
  duration,
  distance = cameraTokens.panDistance,
  direction = 'left',
  easing = 'smooth',
}) => {
  const offset = animate({ frame, from: 0, to: distance, duration, easing });
  return { transform: transform({ x: direction === 'left' ? -offset : offset }) };
};

/** Depth-based offset. `depth` 0 = infinitely far, 1 = at the lens. */
export const parallax = ({
  frame,
  depth = cameraTokens.parallaxDepths.mid,
  distance = 120,
  duration,
  axis = 'y',
  easing = 'linear',
}) => {
  const offset = animate({ frame, from: 0, to: -distance * depth, duration, easing });
  return { transform: transform(axis === 'x' ? { x: offset } : { y: offset }) };
};

/** Continuous floating drift for background elements. */
export const floatMotion = ({
  frame,
  amplitude = ambient.floatAmplitude,
  period = ambient.floatPeriod,
  phase = 0,
  axis = 'y',
}) => {
  const offset = oscillate({ frame, period, phase }) * amplitude;
  return { transform: transform(axis === 'x' ? { x: offset } : { y: offset }) };
};

/** Orbit-style drift on both axes — good for glow blobs. */
export const driftMotion = ({
  frame,
  amplitude = ambient.driftAmplitude,
  period = ambient.driftPeriod,
  phase = 0,
}) => ({
  transform: transform({
    x: oscillate({ frame, period, phase }) * amplitude,
    y: oscillate({ frame, period: period * 1.37, phase: phase + period / 4 }) * amplitude * 0.6,
  }),
});

/**
 * Handheld micro-shake. Deterministic (seeded) so renders are reproducible.
 * Keep `intensity` at 1-3px; anything more stops reading as "premium".
 */
export const handheld = ({ frame, intensity = 1.5, seed = 1, speed = 0.12 }) => {
  const t = frame * speed;
  return {
    transform: transform({
      x: (seededRandom(Math.floor(t) + seed) - 0.5) * intensity * 2,
      y: (seededRandom(Math.floor(t) + seed + 99) - 0.5) * intensity * 2,
    }),
  };
};

/** Zoom that keeps a focal point fixed — for punching into detail. */
export const zoomTo = ({
  frame,
  duration,
  scale = 1.35,
  focal = { x: 50, y: 50 },
  easing = 'standard',
  delay = 0,
}) => ({
  transform: transform({ scale: animate({ frame, from: 1, to: scale, delay, duration, easing }) }),
  transformOrigin: `${focal.x}% ${focal.y}%`,
});

/**
 * Rack focus between two stacked layers — the outgoing layer defocuses and
 * dissolves out while the incoming layer (already faintly present, per the
 * "focus rack" transition language) sharpens and settles in.
 *
 * Pure two-sided tween, no masking: both layers render full-bleed and stacked
 * (incoming beneath outgoing), so the handoff is entirely blur + opacity + a
 * hair of scale settle — the most physically-motivated of the transition
 * techniques, since it mimics an actual depth-of-field rack rather than
 * compositing a cut.
 *
 * @returns {{ outgoing: object, incoming: object }} style objects for the two layers.
 */
export const focusRack = ({
  frame,
  duration,
  delay = 0,
  easing = 'smooth',
  maxBlur = 26,
  incomingStartBlur = 18,
  incomingStartOpacity = 0.32,
  incomingSettleScale = 1.03,
}) => {
  const progress = animate({ frame, from: 0, to: 1, delay, duration, easing });

  return {
    outgoing: {
      filter: `blur(${progress * maxBlur}px)`,
      opacity: 1 - progress,
    },
    incoming: {
      filter: `blur(${incomingStartBlur * (1 - progress)}px)`,
      opacity: incomingStartOpacity + (1 - incomingStartOpacity) * progress,
      transform: transform({ scale: incomingSettleScale - (incomingSettleScale - 1) * progress }),
    },
  };
};

/**
 * Named camera vocabulary. A `Scene` selects one with `camera="push"`.
 * Keep it small and curated — the same discipline as the preset registries.
 */
const cameraRegistry = createRegistry({
  label: 'camera',
  fallback: 'static',
  entries: {
    /** No camera move — a deliberately locked-off shot. */
    static: () => ({}),
    /** The house default: a slow ~6% push-in. */
    push: (ctx) => cameraPush(ctx),
    /** A gentler push, for talking-head / lower-third scenes. */
    pushIn: (ctx) => cameraPush({ ...ctx, amount: cameraTokens.pushScale * 0.6 }),
    /** Slow pull-out. */
    pull: (ctx) => cameraPull(ctx),
    /** Lateral drift, for a dolly feel. */
    pan: (ctx) => cameraPan(ctx),
    /** Two-axis ambient drift. */
    drift: (ctx) => driftMotion(ctx),
    /** Documentary handheld micro-shake. Use sparingly, on the scene wrapper. */
    handheld: (ctx) => handheld(ctx),
  },
});

/** Live view of the named camera vocabulary. */
export const cameras = cameraRegistry.entries;

/** Resolves a camera name (or a custom function) to a camera move. */
export const resolveCamera = cameraRegistry.resolve;

/** Add a camera move without touching core — see `docs/EXTENDING.md`. */
export const registerCamera = cameraRegistry.register;
