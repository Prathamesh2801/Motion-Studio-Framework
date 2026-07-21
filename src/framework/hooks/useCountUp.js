import { useCurrentFrame } from 'remotion';
import { animate } from '../animations/core.js';
import { durations } from '../motion/index.js';

/**
 * Animated numeric counter for stat blocks and similar.
 * Eased rather than linear, so it decelerates into its final value. Returns a
 * raw number — formatting (separators, %, compact) is the caller's job via
 * `helpers/format.js`.
 */
export const useCountUp = ({
  to,
  from = 0,
  delay = 0,
  duration = durations.slower,
  easing = 'standard',
  decimals = 0,
}) => {
  const frame = useCurrentFrame();
  const value = animate({ frame, from, to, delay, duration, easing });
  return decimals === 0 ? Math.round(value) : Number(value.toFixed(decimals));
};

export default useCountUp;
