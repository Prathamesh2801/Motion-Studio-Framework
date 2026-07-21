import { useCurrentFrame, useVideoConfig } from 'remotion';
import { resolvePreset, entrances, exits, ambientPresets } from '../presets/index.js';
import { mergeMotion } from '../animations/merge.js';
import { staggerDelay } from '../animations/core.js';
import { durations, stagger as staggerTokens } from '../motion/index.js';

/**
 * React bindings for the animation library.
 *
 * These, plus `useSceneProgress`/`useCountUp`, are the ONLY place components
 * touch `useCurrentFrame()`, which keeps the animation helpers themselves pure
 * and reusable outside React.
 */

/**
 * Entrance (and optional exit) styles for a single element.
 *
 * @param {object} options
 * @param {string|Function} [options.preset] Name from `presets.entrances`.
 * @param {number} [options.delay]     Frames before the entrance starts.
 * @param {number} [options.duration]  Entrance length in frames.
 * @param {string|Function} [options.exitPreset] Name from `presets.exits`.
 * @param {number} [options.exitAt]    Frame at which the exit begins.
 */
export const useMotion = ({
  preset = 'rise',
  delay = 0,
  duration = durations.base,
  easing,
  exitPreset = 'fade',
  exitAt,
  exitDuration = durations.fast,
  ...rest
} = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = resolvePreset(preset, entrances)({
    frame,
    fps,
    delay,
    duration,
    easing,
    ...rest,
  });

  if (exitAt === undefined) return enter;

  const exit = resolvePreset(exitPreset, exits)({
    frame,
    fps,
    delay: exitAt,
    duration: exitDuration,
  });

  return mergeMotion(enter, exit);
};

/**
 * Per-index motion for a list. Returns a function so the caller stays in
 * control of rendering:
 *
 *   const motionAt = useStaggeredMotion({ count: items.length });
 *   items.map((item, i) => <div style={motionAt(i)} />)
 */
export const useStaggeredMotion = ({
  count,
  preset = 'rise',
  delay = 0,
  step = staggerTokens.base,
  duration = durations.base,
  from = 'start',
  ...rest
} = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const motionFn = resolvePreset(preset, entrances);

  return (index) =>
    motionFn({
      frame,
      fps,
      delay: delay + staggerDelay(index, count, step, from),
      duration,
      ...rest,
    });
};

/** Continuous ambient motion (float, drift, levitate). Never ends. */
export const useAmbientMotion = ({ preset = 'float', ...options } = {}) => {
  const frame = useCurrentFrame();
  return resolvePreset(preset, ambientPresets)({ frame, ...options });
};
