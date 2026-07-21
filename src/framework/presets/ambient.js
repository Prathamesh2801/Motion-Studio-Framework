import { mergeMotion } from '../animations/merge.js';
import { floatMotion, driftMotion, handheld } from '../camera/index.js';
import { breathe } from '../animations/scale.js';
import { sway } from '../animations/rotate.js';

/**
 * Ambient presets — continuous, loop-safe motion with no start or end.
 * Applied to backgrounds, glow blobs and hero art so no frame is ever static.
 */
export const ambientPresets = {
  none: () => ({}),

  /** Slow vertical float. The default for anything decorative. */
  float: (ctx) => floatMotion(ctx),

  /** Two-axis drift, for glow blobs behind content. */
  drift: (ctx) => driftMotion(ctx),

  /** Float + scale breathing. For product cutouts and hero art. */
  levitate: (ctx) => mergeMotion(floatMotion(ctx), breathe(ctx)),

  /** Float + micro-tilt. Reads as a physical object held in view. */
  hover: (ctx) => mergeMotion(floatMotion(ctx), sway({ ...ctx, amplitude: 1.2 })),

  /** Documentary feel. Use only on full-scene wrappers. */
  handheld: (ctx) => handheld(ctx),
};

export default ambientPresets;
