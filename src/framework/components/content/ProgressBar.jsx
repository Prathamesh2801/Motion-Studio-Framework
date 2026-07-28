import React from 'react';
import { useCurrentFrame } from 'remotion';
import { animate } from '../../animations/core.js';
import { useTheme } from '../../theme/index.js';
import { useFormat } from '../../hooks/useFormat.js';
import { useMotion } from '../../hooks/useMotion.js';
import { durations } from '../../motion/index.js';
import { alpha } from '../../helpers/color.js';

/**
 * A bounded value, drawn as a filling track.
 *
 * ── WHY THIS IS A DIFFERENT COMPONENT FROM StatCard ─────────────────────────
 * A counter and a bar answer different questions. "73 goals" is a tally: there
 * is no ceiling, and a bar would have to invent one. "7.9 out of 10" is a
 * proportion, and printing it without the 10 throws away the only thing that
 * makes 7.9 mean anything.
 *
 * Which one to draw is therefore a property of the DATA — a metric either has a
 * `max` or it does not — and never a prop a human sets per video. See
 * `engine/schema/primitives.js`.
 *
 * The fill eases to its value rather than jumping, on the same curve the rest of
 * the motion system uses, so a row of bars reads as one gesture.
 */
export const ProgressBar = ({
  value,
  max,
  /** Bar height in design px; scaled per format like every other measurement. */
  thickness = 10,
  radius,
  color,
  trackColor,
  delay = 0,
  duration = durations.slower,
  easing = 'standard',
  /** Entrance for the bar as a whole. The FILL always animates. */
  preset = 'fade',
  style,
}) => {
  const theme = useTheme();
  const { px } = useFormat();
  const frame = useCurrentFrame();
  const motionStyle = useMotion({ preset, delay, duration: durations.base });

  if (!Number.isFinite(max) || max <= 0) {
    throw new Error(`ProgressBar: \`max\` must be a positive number, got ${JSON.stringify(max)}.`);
  }

  // Clamped, because real data overshoots its own ceiling more often than
  // anyone expects — a 102% retention figure would otherwise draw a bar past
  // the end of its track and out of the card.
  const target = Math.min(1, Math.max(0, value / max));
  const progress = animate({ frame, from: 0, to: target, delay, duration, easing });

  // `primary`, not `accent` — see the note in RatingArc. Figures across one
  // film have to agree on a colour.
  const fill = color ?? theme.colors.primary;

  return (
    <div
      style={{
        ...motionStyle,
        width: '100%',
        height: px(thickness),
        borderRadius: px(radius ?? thickness),
        backgroundColor: trackColor ?? alpha(theme.colors.text.primary, 0.1),
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: '100%',
          borderRadius: 'inherit',
          background: fill,
        }}
      />
    </div>
  );
};

export default ProgressBar;
