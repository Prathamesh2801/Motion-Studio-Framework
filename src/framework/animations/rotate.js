import { animate, oscillate } from './core.js';
import { durations } from '../motion/index.js';
import { transform } from '../helpers/style.js';

/** Rotation. Kept subtle — a few degrees is usually enough. */

export const rotateIn = ({
  frame,
  from = -6,
  to = 0,
  delay = 0,
  duration = durations.slow,
  easing = 'entrance',
}) => ({
  transform: transform({ rotate: animate({ frame, from, to, delay, duration, easing }) }),
});

/** Constant-speed spin, for loaders and decorative rings. */
export const spin = ({ frame, period = 360, direction = 1 }) => ({
  transform: transform({ rotate: ((frame / period) * 360 * direction) % 360 }),
});

/** Gentle back-and-forth tilt, adds life to static product shots. */
export const sway = ({ frame, amplitude = 2, period = 240, phase = 0 }) => ({
  transform: transform({ rotate: oscillate({ frame, period, phase }) * amplitude }),
});

/** 3D card turn. Requires a perspective on the parent. */
export const flipIn = ({
  frame,
  axis = 'y',
  from = 24,
  delay = 0,
  duration = durations.slow,
  easing = 'entrance',
}) => {
  const angle = animate({ frame, from, to: 0, delay, duration, easing });
  return {
    transform: transform(axis === 'x' ? { rotateX: angle } : { rotateY: angle }),
  };
};
