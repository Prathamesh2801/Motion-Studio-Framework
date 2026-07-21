import React from 'react';
import { Text } from '../typography/Text.jsx';
import { useTheme } from '../../theme/index.js';
import { useFormat } from '../../hooks/useFormat.js';
import { useMotion } from '../../hooks/useMotion.js';
import { alpha } from '../../helpers/color.js';
import { durations } from '../../motion/index.js';

/** Small pill label — category tags, "NEW", availability status. */
export const Badge = ({ children, color, delay = 0, duration = durations.fast, preset = 'settle', style }) => {
  const theme = useTheme();
  const { px } = useFormat();
  const motionStyle = useMotion({ preset, delay, duration });
  const tint = color ?? theme.colors.primary;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        alignSelf: 'flex-start',
        padding: `${px(theme.spacing.xs)}px ${px(theme.spacing.md)}px`,
        borderRadius: theme.radii.pill,
        background: alpha(tint, 0.12),
        boxShadow: `inset 0 0 0 1px ${alpha(tint, 0.35)}`,
        ...motionStyle,
        ...style,
      }}
    >
      <Text variant="eyebrow" color={tint} motion={null}>
        {children}
      </Text>
    </div>
  );
};

export default Badge;
