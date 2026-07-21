import { animate } from './core.js';
import { durations } from '../motion/index.js';

/**
 * Opacity animations. Every helper in `animations/` returns a plain style
 * object so it can be spread onto any element or merged with other helpers.
 */

export const fadeIn = ({ frame, delay = 0, duration = durations.base, easing = 'entrance' }) => ({
  opacity: animate({ frame, from: 0, to: 1, delay, duration, easing }),
});

export const fadeOut = ({ frame, delay = 0, duration = durations.fast, easing = 'exit' }) => ({
  opacity: animate({ frame, from: 1, to: 0, delay, duration, easing }),
});

/** Fade in, hold, fade out — for lower-thirds and captions. */
export const fadeInOut = ({
  frame,
  delay = 0,
  duration = durations.base,
  hold = durations.slower,
  outDuration = durations.fast,
}) => {
  const inOpacity = animate({ frame, from: 0, to: 1, delay, duration, easing: 'entrance' });
  const outOpacity = animate({
    frame,
    from: 1,
    to: 0,
    delay: delay + duration + hold,
    duration: outDuration,
    easing: 'exit',
  });
  return { opacity: Math.min(inOpacity, outOpacity) };
};

/** Fade paired with a defocus — reads as "arriving from depth". */
export const blurIn = ({
  frame,
  delay = 0,
  duration = durations.slow,
  blur = 16,
  easing = 'entrance',
}) => ({
  opacity: animate({ frame, from: 0, to: 1, delay, duration: duration * 0.7, easing }),
  filter: `blur(${animate({ frame, from: blur, to: 0, delay, duration, easing })}px)`,
});
