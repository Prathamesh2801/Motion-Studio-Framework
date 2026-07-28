import React from 'react';
import { Text } from '../typography/Text.jsx';
import { useTheme } from '../../theme/index.js';
import { durations } from '../../motion/index.js';
import { useCountUp } from '../../hooks/useCountUp.js';
import { withSeparators, compactNumber } from '../../helpers/format.js';

/**
 * A bare animated number.
 *
 * `StatCard` already counts up, but it also owns a label, a surface and a
 * layout. Any composition that wants the number somewhere else — inside a
 * headline, next to a bar, over a portrait — had to either accept the card's
 * arrangement or re-implement the counter. This is the counter alone.
 *
 * `display` exists for values that are only nominally numeric: a lap time of
 * "1:31.447" or a score of "6-4, 7-5" still deserves to animate, so the counter
 * runs against `value` for the motion and the caller supplies the string.
 * Without it, anything unformattable had to be a static label.
 */
export const CountUp = ({
  value,
  from = 0,
  display,
  format = 'separated',
  decimals = 0,
  prefix = '',
  suffix = '',
  delay = 0,
  duration = durations.slower,
  easing = 'standard',
  variant = 'stat',
  color,
  align,
  style,
  ...rest
}) => {
  const theme = useTheme();

  const numeric = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(numeric)) {
    throw new Error(
      `CountUp: \`value\` must be a number, got ${JSON.stringify(value)}. ` +
        'Use `display` for a pre-formatted string, and `prefix`/`suffix` for units.',
    );
  }

  const current = useCountUp({ to: numeric, from, delay, duration, easing, decimals });

  const formatters = {
    plain: (n) => (decimals ? n.toFixed(decimals) : String(n)),
    separated: (n) => withSeparators(n),
    compact: (n) => compactNumber(n, decimals),
  };
  const printed = display ?? (formatters[format] ?? formatters.separated)(current);

  return (
    <Text
      variant={variant}
      color={color ?? theme.colors.primary}
      align={align}
      motion={null}
      style={style}
      {...rest}
    >
      {`${prefix}${printed}${suffix}`}
    </Text>
  );
};

export default CountUp;
