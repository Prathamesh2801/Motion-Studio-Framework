import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useTheme } from '../../theme/index.js';
import { zIndex } from '../../formats/index.js';
import { useAmbientMotion } from '../../hooks/useMotion.js';
import { useFormat } from '../../hooks/useFormat.js';
import { alpha } from '../../helpers/color.js';

/**
 * Faint technical grid. Signals "engineered" without any assets. Fades out
 * toward the edges so it never reads as a hard pattern.
 */
export const GridLayer = ({ size = 120, color, opacity = 0.05, ambient = 'float', ambientOptions = { amplitude: 10, period: 400 }, style }) => {
  const theme = useTheme();
  const { px } = useFormat();
  const motionStyle = useAmbientMotion({ preset: ambient, ...ambientOptions });
  const cell = px(size);
  const line = alpha(color ?? theme.colors.text.primary, 1);
  const mask = 'radial-gradient(ellipse at center, #000 30%, transparent 78%)';

  return (
    <AbsoluteFill style={{ zIndex: zIndex.gradient, pointerEvents: 'none', ...style }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
          backgroundSize: `${cell}px ${cell}px`,
          opacity,
          maskImage: mask,
          WebkitMaskImage: mask,
          ...motionStyle,
        }}
      />
    </AbsoluteFill>
  );
};

export default GridLayer;
