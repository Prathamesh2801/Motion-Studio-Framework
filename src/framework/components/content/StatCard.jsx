import React from 'react';
import { Surface } from '../primitives/Surface.jsx';
import { Text } from '../typography/Text.jsx';
import { Stagger } from '../primitives/Stagger.jsx';
import { useTheme } from '../../theme/index.js';
import { durations, stagger as staggerTokens } from '../../motion/index.js';
import { useCountUp } from '../../hooks/useCountUp.js';
import { useMotion } from '../../hooks/useMotion.js';
import { useFormat } from '../../hooks/useFormat.js';
import { withSeparators, compactNumber } from '../../helpers/format.js';

/**
 * A single animated metric. The number counts up rather than fading in — motion
 * applied to *meaning* rather than decoration.
 *
 * @param {'plain'|'separated'|'compact'} [props.format]
 */
export const StatCard = ({
  value,
  label,
  prefix = '',
  suffix = '',
  format = 'separated',
  decimals = 0,
  accent,
  bare = false,
  delay = 0,
  duration = durations.slower,
  /** Set to 'none' when a parent (e.g. a grid) already animates entry. */
  preset = 'rise',
  style,
}) => {
  const theme = useTheme();
  const { px } = useFormat();

  // The value counts up, so it has to be a number. Stat data very often arrives
  // as a string — from JSON, a CMS, or a hand-written content file — and passing
  // one straight through produced `interpolate: outputRange must contain only
  // numbers`, an error that points into Remotion's internals and says nothing
  // about which card is at fault. Coerce what is clearly numeric; fail here,
  // by name, for anything else.
  const numeric = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(numeric)) {
    throw new Error(
      `StatCard${label ? ` ("${label}")` : ''}: \`value\` must be a number, got ` +
        `${JSON.stringify(value)}. Put units in \`prefix\`/\`suffix\` rather than in the value.`,
    );
  }

  const current = useCountUp({ to: numeric, delay, duration, decimals });
  const motionStyle = useMotion({ preset, delay, duration: durations.base });
  const accentColor = accent ?? theme.colors.primary;

  const formatters = {
    plain: (n) => (decimals ? n.toFixed(decimals) : String(n)),
    separated: (n) => withSeparators(n),
    compact: (n) => compactNumber(n, decimals),
  };
  const display = (formatters[format] ?? formatters.separated)(current);

  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: px(theme.spacing.xs) }}>
      <Text variant="stat" color={accentColor} motion={null}>
        {`${prefix}${display}${suffix}`}
      </Text>
      {label ? (
        <Text variant="caption" color={theme.colors.text.muted} uppercase motion={null}>
          {label}
        </Text>
      ) : null}
    </div>
  );

  if (bare) return <div style={{ ...motionStyle, ...style }}>{body}</div>;

  return (
    <Surface padding={theme.spacing.lg} style={{ ...motionStyle, ...style }}>
      {body}
    </Surface>
  );
};

/** A row (or column) of stats with staggered entrances. */
export const StatRow = ({ stats = [], delay = 0, step = staggerTokens.loose, gap, direction = 'row', bare = false, style }) => {
  const theme = useTheme();
  return (
    <Stagger preset="none" direction={direction} gap={gap ?? theme.spacing.lg} style={style}>
      {stats.map((stat, index) => (
        <StatCard key={stat.id ?? stat.label} {...stat} bare={bare} delay={delay + index * step} style={{ flex: 1 }} />
      ))}
    </Stagger>
  );
};

export default StatCard;
