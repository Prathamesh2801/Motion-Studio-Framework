import { animate } from './core.js';
import { durations, distances } from '../motion/index.js';
import { transform } from '../helpers/style.js';

/** Directional movement. `direction` names where the element comes FROM. */

const VECTORS = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
};

export const slideIn = ({
  frame,
  direction = 'up',
  distance = distances.md,
  delay = 0,
  duration = durations.base,
  easing = 'entrance',
}) => {
  const vector = VECTORS[direction] ?? VECTORS.up;
  const offset = animate({ frame, from: distance, to: 0, delay, duration, easing });
  return { transform: transform({ x: vector.x * offset, y: vector.y * offset }) };
};

export const slideOut = ({
  frame,
  direction = 'up',
  distance = distances.sm,
  delay = 0,
  duration = durations.fast,
  easing = 'exit',
}) => {
  const vector = VECTORS[direction] ?? VECTORS.up;
  const offset = animate({ frame, from: 0, to: -distance, delay, duration, easing });
  return { transform: transform({ x: vector.x * offset, y: vector.y * offset }) };
};

/** The house default: rise + fade. Used by most text entrances. */
export const riseIn = ({
  frame,
  distance = distances.sm,
  delay = 0,
  duration = durations.base,
  easing = 'entrance',
}) => ({
  opacity: animate({ frame, from: 0, to: 1, delay, duration: duration * 0.8, easing }),
  transform: transform({
    y: animate({ frame, from: distance, to: 0, delay, duration, easing }),
  }),
});
