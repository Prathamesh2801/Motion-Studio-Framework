import React from 'react';
import { useCurrentFrame } from 'remotion';
import { useTheme } from '../../theme/index.js';
import { useFormat } from '../../hooks/useFormat.js';
import { drawLine } from '../../animations/reveal.js';
import { alpha } from '../../helpers/color.js';
import { durations } from '../../motion/index.js';

/**
 * A hairline rule that draws itself. Separates a title from its body, or
 * underlines a stat. Fades toward its far end so it never looks like a hard
 * border.
 */
export const Divider = ({
  width = '100%',
  thickness = 2,
  color,
  orientation = 'horizontal',
  delay = 0,
  duration = durations.slow,
  origin = 'left',
  fade = true,
  style,
}) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const { px } = useFormat();
  const stroke = color ?? theme.colors.primary;

  const isHorizontal = orientation === 'horizontal';
  const axis = isHorizontal ? 'to right' : 'to bottom';
  const draw = drawLine({ frame, delay, duration, origin: isHorizontal ? origin : 'top' });
  const growth = isHorizontal
    ? draw
    : { ...draw, transform: draw.transform.replace('scaleX', 'scaleY') };

  return (
    <div
      style={{
        width: isHorizontal ? width : px(thickness),
        height: isHorizontal ? px(thickness) : width,
        background: fade
          ? `linear-gradient(${axis}, ${stroke} 0%, ${alpha(stroke, 0)} 100%)`
          : stroke,
        ...growth,
        ...style,
      }}
    />
  );
};

export default Divider;
