import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useTheme } from '../../theme/index.js';
import { zIndex } from '../../formats/index.js';
import { useAmbientMotion } from '../../hooks/useMotion.js';
import { useFormat } from '../../hooks/useFormat.js';
import { alpha } from '../../helpers/color.js';

/**
 * A soft coloured light source behind the content — the main source of depth.
 * Place two or three with different colours, positions and drift phases to build
 * an atmosphere.
 *
 * @param {string} [color]    Light colour (defaults to the theme primary).
 * @param {{x:number,y:number}} [position] Percent coordinates within the frame.
 * @param {number} [size]     Diameter as a percentage of frame width.
 * @param {string} [ambient]  Ambient preset name ('drift', 'float', 'none').
 */
export const GlowLayer = ({
  color,
  position = { x: 50, y: 40 },
  size = 60,
  intensity = 0.5,
  blur,
  ambient = 'drift',
  ambientOptions = {},
  style,
}) => {
  const theme = useTheme();
  const { width } = useFormat();
  const motionStyle = useAmbientMotion({ preset: ambient, ...ambientOptions });
  const diameter = (size / 100) * width;
  const tint = color ?? theme.colors.primary;
  const blurRadius = blur ?? theme.blurs.ambient;

  return (
    <AbsoluteFill style={{ zIndex: zIndex.glow, pointerEvents: 'none', ...style }}>
      <div
        style={{
          position: 'absolute',
          left: `${position.x}%`,
          top: `${position.y}%`,
          width: diameter,
          height: diameter,
          marginLeft: -diameter / 2,
          marginTop: -diameter / 2,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(tint, intensity)} 0%, ${alpha(tint, 0)} 70%)`,
          filter: `blur(${blurRadius}px)`,
          ...motionStyle,
        }}
      />
    </AbsoluteFill>
  );
};

export default GlowLayer;
