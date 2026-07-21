import React from 'react';
import { AbsoluteFill } from 'remotion';
import { zIndex } from '../../formats/index.js';
import { alpha } from '../../helpers/color.js';

/**
 * Darkens the frame edges so the eye is pulled to the centre.
 *
 * Default tint is black, which suits the dark canvas. A light-canvas brand
 * should pass a warm dark colour instead — pure black over a light ground reads
 * as grime. Strength stays low (0.15–0.35); higher looks like a photo filter.
 */
export const VignetteLayer = ({ strength = 0.3, color = '#000000', spread = 52, style }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, ${alpha(color, 0)} ${spread}%, ${alpha(color, strength)} 100%)`,
      pointerEvents: 'none',
      zIndex: zIndex.overlay,
      ...style,
    }}
  />
);

export default VignetteLayer;
