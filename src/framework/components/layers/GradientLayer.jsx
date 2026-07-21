import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useTheme } from '../../theme/index.js';
import { zIndex } from '../../formats/index.js';

/**
 * A full-frame gradient wash — the base of almost every background.
 *
 * @param {string} [gradient] Any CSS background value; defaults to the theme canvas.
 * @param {number} [opacity]
 * @param {string} [blendMode] e.g. 'screen' to stack a second gradient on top.
 */
export const GradientLayer = ({ gradient, opacity = 1, blendMode = 'normal', style }) => {
  const theme = useTheme();
  return (
    <AbsoluteFill
      style={{
        background: gradient ?? theme.colors.gradients.canvas,
        opacity,
        mixBlendMode: blendMode,
        zIndex: zIndex.gradient,
        ...style,
      }}
    />
  );
};

export default GradientLayer;
