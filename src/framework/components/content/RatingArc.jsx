import React from 'react';
import { useCurrentFrame } from 'remotion';
import { animate } from '../../animations/core.js';
import { useTheme } from '../../theme/index.js';
import { useFormat } from '../../hooks/useFormat.js';
import { useMotion } from '../../hooks/useMotion.js';
import { durations } from '../../motion/index.js';
import { alpha } from '../../helpers/color.js';

/**
 * A bounded value, drawn as a sweeping arc.
 *
 * The radial sibling of `ProgressBar`, for the one metric a shot wants to make
 * the subject of the frame rather than a row entry. Same data contract (`value`
 * + `max`), same easing, so the two can appear in one film without disagreeing
 * about what "full" looks like.
 *
 * Drawn as an SVG stroke with an animated `strokeDashoffset` rather than with
 * `@remotion/shapes`, because the arc needs to be PARTIAL and stroke-dashed —
 * the shapes package draws whole forms. `pathLength="1"` normalises the maths so
 * the dash offset is just `1 - progress` and does not depend on the radius.
 */
export const RatingArc = ({
  value,
  max,
  /** Outer diameter in design px. */
  size = 220,
  thickness = 14,
  /** Degrees of sweep. 360 is a full ring; 270 leaves a gap at the bottom. */
  sweep = 270,
  color,
  trackColor,
  delay = 0,
  duration = durations.slower,
  easing = 'standard',
  /** `settle` — fade + a small scale-up, which suits a ring resolving into place. */
  preset = 'settle',
  children,
  style,
}) => {
  const theme = useTheme();
  const { px } = useFormat();
  const frame = useCurrentFrame();
  const motionStyle = useMotion({ preset, delay, duration: durations.base });

  if (!Number.isFinite(max) || max <= 0) {
    throw new Error(`RatingArc: \`max\` must be a positive number, got ${JSON.stringify(max)}.`);
  }

  const target = Math.min(1, Math.max(0, value / max));
  const progress = animate({ frame, from: 0, to: target, delay, duration, easing });

  // Geometry in a normalised 100x100 box, scaled by CSS. The stroke is centred
  // on the path, so the radius has to be inset by half the stroke width or the
  // arc is clipped by the viewBox.
  const strokeWidth = (thickness / size) * 100;
  const radius = 50 - strokeWidth / 2;
  const fraction = sweep / 360;

  // An SVG circle's path starts at 3 o'clock, so the whole thing is rotated to
  // put the START of the sweep where it belongs. A partial arc centres its GAP
  // at the bottom (the shape a rating dial is expected to have); a full ring has
  // no gap, so it starts at the top, which is where a complete circle is read
  // as beginning. Deriving one rule for both put the gap on the left.
  const rotation = sweep >= 360 ? -90 : 90 + (360 - sweep) / 2;

  const arc = (
    <circle
      cx="50"
      cy="50"
      r={radius}
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      pathLength="1"
    />
  );

  return (
    <div
      style={{
        ...motionStyle,
        position: 'relative',
        width: px(size),
        height: px(size),
        ...style,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{ transform: `rotate(${rotation}deg)`, overflow: 'visible' }}
      >
        {React.cloneElement(arc, {
          stroke: trackColor ?? alpha(theme.colors.text.primary, 0.1),
          strokeDasharray: `${fraction} 1`,
        })}
        {React.cloneElement(arc, {
          // `primary`, not `accent` — matching StatCard. Figures across a film
          // must agree on one colour, and in several brands (including the
          // default) accent is a contrast hue, so a bar and a counter side by
          // side came out in two different colours.
          stroke: color ?? theme.colors.primary,
          strokeDasharray: `${fraction * progress} 1`,
        })}
      </svg>

      {children ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
};

export default RatingArc;
