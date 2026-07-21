import { animate, springProgress, oscillate } from './core.js';
import { durations, ambient } from '../motion/index.js';
import { lerp } from '../helpers/math.js';
import { transform } from '../helpers/style.js';

/** Scale animations. Keep deltas small — large scale jumps read as cheap. */

export const scaleIn = ({
  frame,
  from = 0.92,
  to = 1,
  delay = 0,
  duration = durations.base,
  easing = 'entrance',
}) => ({
  transform: transform({ scale: animate({ frame, from, to, delay, duration, easing }) }),
});

export const scaleOut = ({
  frame,
  from = 1,
  to = 1.04,
  delay = 0,
  duration = durations.fast,
  easing = 'exit',
}) => ({
  transform: transform({ scale: animate({ frame, from, to, delay, duration, easing }) }),
});

/** Spring-driven pop, for objects that should feel physical. */
export const scalePop = ({
  frame,
  fps,
  delay = 0,
  from = 0.8,
  to = 1,
  config = 'physical',
}) => {
  const progress = springProgress({ frame, fps, delay, config });
  return { transform: transform({ scale: lerp(from, to, progress) }) };
};

/** Continuous, barely-there breathing. Use on hero art, never on text. */
export const breathe = ({
  frame,
  amount = ambient.breathScale,
  period = ambient.floatPeriod * 2,
  phase = 0,
}) => ({
  transform: transform({ scale: 1 + oscillate({ frame, period, phase }) * amount }),
});
