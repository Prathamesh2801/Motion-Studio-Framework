import React from 'react';
import { useTheme } from '../../theme/index.js';
import { useFormat } from '../../hooks/useFormat.js';

/**
 * The panel/card chrome, extracted so every card in the system shares exactly
 * one recipe for background, border, radius and elevation. Theme-driven.
 */
export const Surface = ({
  children,
  padding,
  radius,
  elevation = 'md',
  background,
  bordered = true,
  style,
}) => {
  const theme = useTheme();
  const { px } = useFormat();

  const pad = padding ?? theme.spacing.lg;
  const cornerRadius = radius ?? theme.radii.lg;
  const bg = background ?? theme.colors.gradients.surface;

  return (
    <div
      style={{
        background: bg,
        borderRadius: cornerRadius,
        padding: px(pad),
        boxShadow: [
          theme.shadows[elevation] ?? theme.shadows.md,
          bordered ? theme.strokes.inset : null,
          theme.strokes.raised,
        ]
          .filter(Boolean)
          .join(', '),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Surface;
