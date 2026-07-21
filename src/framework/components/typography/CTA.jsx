import React from 'react';
import { Text } from './Text.jsx';
import { useTheme } from '../../theme/index.js';
import { useFormat } from '../../hooks/useFormat.js';
import { useMotion } from '../../hooks/useMotion.js';
import { alpha } from '../../helpers/color.js';
import { durations } from '../../motion/index.js';

/**
 * Call-to-action pill. `variant` controls emphasis:
 *  - `solid`   filled brand gradient, for the primary action
 *  - `outline` hairline border, for a secondary action
 *  - `ghost`   text only, for a URL or handle
 */
export const CTA = ({ children, variant = 'solid', icon, delay = 0, duration = durations.base, preset = 'settle', style, ...rest }) => {
  const theme = useTheme();
  const { colors, spacing, radii } = theme;
  const { px } = useFormat();
  const motionStyle = useMotion({ preset, delay, duration });

  const variants = {
    solid: {
      background: colors.gradients.brand,
      boxShadow: `0 ${px(6)}px ${px(20)}px ${colors.shade.strong}`,
      color: colors.text.onAccent,
    },
    outline: {
      background: 'transparent',
      boxShadow: `inset 0 0 0 2px ${alpha(colors.primary, 0.4)}`,
      color: colors.primary,
    },
    ghost: {
      background: 'transparent',
      boxShadow: 'none',
      color: colors.text.secondary,
    },
  };

  const skin = variants[variant] ?? variants.solid;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        alignSelf: 'center',
        gap: px(spacing.sm),
        padding: `${px(spacing.md)}px ${px(spacing.lg)}px`,
        borderRadius: radii.pill,
        background: skin.background,
        boxShadow: skin.boxShadow,
        ...motionStyle,
        ...style,
      }}
      {...rest}
    >
      {icon}
      <Text variant="cta" color={skin.color} motion={null}>
        {children}
      </Text>
    </div>
  );
};

export default CTA;
