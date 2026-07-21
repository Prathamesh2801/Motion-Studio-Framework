import { Easing } from 'remotion';
import { curves } from '../motion/index.js';
import { resolveFrom } from '../helpers/registry.js';

/**
 * Theme curves resolved into Remotion easing functions.
 * Always animate with one of these — never `Easing.linear` by accident.
 */
const toEasing = ([a, b, c, d]) => Easing.bezier(a, b, c, d);

export const easings = {
  standard: toEasing(curves.standard),
  entrance: toEasing(curves.entrance),
  exit: toEasing(curves.exit),
  smooth: toEasing(curves.smooth),
  emphasized: toEasing(curves.emphasized),
  linear: Easing.linear,
};

/**
 * Accepts a token name, a raw bezier array, or a ready easing function.
 * An unknown NAME throws — see `helpers/registry.js` for why a typo must not
 * silently resolve to the default curve.
 */
export const resolveEasing = (easing) =>
  resolveFrom(easings, easing, {
    label: 'easing',
    fallback: 'standard',
    coerce: (spec) => (Array.isArray(spec) ? toEasing(spec) : undefined),
  });
