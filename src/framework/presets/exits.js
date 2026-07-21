import { mergeMotion } from '../animations/merge.js';
import { fadeOut } from '../animations/fade.js';
import { scaleOut } from '../animations/scale.js';
import { slideOut } from '../animations/slide.js';
import { durations, distances } from '../motion/index.js';

/**
 * Exit presets. Deliberately faster than entrances — the viewer has already
 * read the content, so lingering exits waste screen time.
 */

const withDefaults = (context) => ({
  delay: 0,
  duration: durations.fast,
  easing: 'exit',
  ...context,
});

export const exits = {
  /** No exit. */
  none: () => ({}),

  fade: (ctx) => fadeOut(withDefaults(ctx)),

  /** Drifts up and away — the counterpart to `entrances.rise`. */
  lift: (ctx) => {
    const c = withDefaults(ctx);
    return mergeMotion(fadeOut(c), slideOut({ ...c, direction: 'up', distance: distances.sm }));
  },

  /** Recedes forward, as if the camera passed through it. */
  recede: (ctx) => {
    const c = withDefaults(ctx);
    return mergeMotion(fadeOut(c), scaleOut({ ...c, from: 1, to: 1.08 }));
  },

  /** Shrinks away — for badges and small chips. */
  collapse: (ctx) => {
    const c = withDefaults(ctx);
    return mergeMotion(fadeOut(c), scaleOut({ ...c, from: 1, to: 0.92 }));
  },
};

export default exits;
