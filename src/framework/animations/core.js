import { interpolate, spring as remotionSpring } from 'remotion';
import { resolveEasing } from './easing.js';
import { durations, springs } from '../motion/index.js';
import { clamp } from '../helpers/math.js';

/**
 * The two primitives every other animation helper is built on.
 * Both are pure: given a frame they return a number, so they compose freely
 * and can be unit-tested without React.
 */

/**
 * Eased tween over a delay/duration window.
 *
 * @param {object} options
 * @param {number} options.frame   Current frame (local to the sequence).
 * @param {number} [options.from]  Start value.
 * @param {number} [options.to]    End value.
 * @param {number} [options.delay] Frames to wait before starting.
 * @param {number} [options.duration] Length of the tween in frames.
 * @param {string|Array|Function} [options.easing] Curve name, bezier or fn.
 */
export const animate = ({
  frame,
  from = 0,
  to = 1,
  delay = 0,
  duration = durations.base,
  easing = 'standard',
}) =>
  interpolate(frame, [delay, delay + duration], [from, to], {
    easing: resolveEasing(easing),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/**
 * Spring-driven 0..1 progress. Prefer this for anything with physical weight
 * (cards landing, logos settling); prefer `animate` for opacity and camera.
 */
export const springProgress = ({
  frame,
  fps,
  delay = 0,
  config = 'gentle',
  durationInFrames,
}) =>
  remotionSpring({
    frame: frame - delay,
    fps,
    config: typeof config === 'string' ? springs[config] ?? springs.gentle : config,
    durationInFrames,
  });

/**
 * Entrance + exit envelope in one number (0 -> 1 -> 0).
 * `exitAt` is a frame; omit it and the element never animates out.
 */
export const envelope = ({
  frame,
  delay = 0,
  duration = durations.base,
  exitAt,
  exitDuration = durations.fast,
  easing = 'entrance',
  exitEasing = 'exit',
}) => {
  const enter = animate({ frame, delay, duration, easing });
  if (exitAt === undefined) return enter;
  const exit = animate({
    frame,
    from: 1,
    to: 0,
    delay: exitAt,
    duration: exitDuration,
    easing: exitEasing,
  });
  return clamp(Math.min(enter, exit));
};

/**
 * Per-index delay for staggered groups.
 * `from: 'center' | 'end' | 'start'` controls the origin of the wave.
 */
export const staggerDelay = (index, count, step, from = 'start') => {
  if (from === 'end') return (count - 1 - index) * step;
  if (from === 'center') return Math.abs(index - (count - 1) / 2) * step;
  return index * step;
};

/** Continuous 0..1 sine oscillation — for floats, drifts and breathing. */
export const oscillate = ({ frame, period, phase = 0 }) =>
  Math.sin(((frame + phase) / period) * Math.PI * 2);
