import { mergeMotion } from '../animations/merge.js';
import { fadeIn, blurIn } from '../animations/fade.js';
import { scaleIn } from '../animations/scale.js';
import { slideIn, riseIn } from '../animations/slide.js';
import { maskReveal } from '../animations/reveal.js';
import { rotateIn } from '../animations/rotate.js';
import { durations, distances } from '../motion/index.js';

/**
 * Motion presets — the vocabulary the whole studio speaks.
 *
 * A preset is a named recipe: `(context) => styleObject`, where context is
 * `{ frame, fps, delay, duration }`. Components take a `preset` string prop, so
 * choosing motion is a design decision in data, not a code change.
 *
 * Add sparingly. A small, well-chosen set is what makes videos feel like one
 * brand; twenty near-identical entrances is what makes them feel random.
 */

const withDefaults = (context, fallbackDuration) => ({
  delay: 0,
  duration: fallbackDuration,
  easing: 'entrance',
  ...context,
});

export const entrances = {
  /** No motion. Use when a parent already animates the element. */
  none: () => ({}),

  /** Pure opacity. For backgrounds and anything already in position. */
  fade: (ctx) => fadeIn(withDefaults(ctx, durations.slow)),

  /** House default for text: small rise + fade. */
  rise: (ctx) => riseIn(withDefaults(ctx, durations.base)),

  /** Bigger travel — for a single hero element, not lists. */
  riseLarge: (ctx) => riseIn({ ...withDefaults(ctx, durations.slow), distance: distances.lg }),

  /** Text that uncovers itself behind a mask, with a nudge underneath. */
  unmask: (ctx) => {
    const c = withDefaults(ctx, durations.slow);
    return mergeMotion(maskReveal(c), riseIn({ ...c, distance: distances.xs }));
  },

  /** Arrives from depth — fade + defocus + slight up-scale. */
  depth: (ctx) => {
    const c = withDefaults(ctx, durations.slow);
    return mergeMotion(blurIn(c), scaleIn({ ...c, from: 1.06, to: 1 }));
  },

  /** Quiet scale-up for cards, media and panels. */
  settle: (ctx) => {
    const c = withDefaults(ctx, durations.base);
    return mergeMotion(fadeIn(c), scaleIn({ ...c, from: 0.94, to: 1 }));
  },

  /** Enters from the left. Pair with `slideRight` for opposing columns. */
  slideLeft: (ctx) => {
    const c = withDefaults(ctx, durations.base);
    return mergeMotion(fadeIn(c), slideIn({ ...c, direction: 'left' }));
  },

  slideRight: (ctx) => {
    const c = withDefaults(ctx, durations.base);
    return mergeMotion(fadeIn(c), slideIn({ ...c, direction: 'right' }));
  },

  /** Hero element: rises, scales and un-tilts. Use once per video. */
  hero: (ctx) => {
    const c = withDefaults(ctx, durations.cinematic);
    return mergeMotion(
      fadeIn({ ...c, duration: c.duration * 0.5 }),
      slideIn({ ...c, direction: 'up', distance: distances.xl }),
      scaleIn({ ...c, from: 0.9, to: 1 }),
      rotateIn({ ...c, from: -3, to: 0 }),
    );
  },
};

export default entrances;
