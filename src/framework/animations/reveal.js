import { animate } from './core.js';
import { durations } from '../motion/index.js';

/**
 * Mask reveals — content is uncovered rather than moved.
 * This is the single most "premium-looking" technique in the kit: pair a
 * `maskReveal` wrapper with a small `riseIn` on the child for the classic
 * Apple/Linear headline entrance.
 */

const CLIP = {
  up: (p) => `inset(${(1 - p) * 100}% 0% 0% 0%)`,
  down: (p) => `inset(0% 0% ${(1 - p) * 100}% 0%)`,
  left: (p) => `inset(0% ${(1 - p) * 100}% 0% 0%)`,
  right: (p) => `inset(0% 0% 0% ${(1 - p) * 100}%)`,
  center: (p) => `inset(0% ${((1 - p) * 100) / 2}% 0% ${((1 - p) * 100) / 2}%)`,
};

/** `direction` is the direction the reveal travels. */
export const maskReveal = ({
  frame,
  direction = 'up',
  delay = 0,
  duration = durations.slow,
  easing = 'entrance',
}) => {
  const progress = animate({ frame, delay, duration, easing });
  const clip = (CLIP[direction] ?? CLIP.up)(progress);
  return { clipPath: clip, WebkitClipPath: clip };
};

/** A soft-edged wipe using a gradient mask — gentler than a hard clip. */
export const gradientReveal = ({
  frame,
  angle = 90,
  softness = 25,
  delay = 0,
  duration = durations.slow,
  easing = 'entrance',
}) => {
  const progress = animate({ frame, from: -softness, to: 100 + softness, delay, duration, easing });
  const mask = `linear-gradient(${angle}deg, #000 ${progress - softness}%, transparent ${progress + softness}%)`;
  return { maskImage: mask, WebkitMaskImage: mask };
};

/** Animated line/underline that draws itself. */
export const drawLine = ({
  frame,
  delay = 0,
  duration = durations.slow,
  easing = 'entrance',
  origin = 'left',
}) => ({
  transform: `scaleX(${animate({ frame, delay, duration, easing })})`,
  transformOrigin: origin,
});
