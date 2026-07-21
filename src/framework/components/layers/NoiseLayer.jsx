import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { zIndex } from '../../formats/index.js';

/**
 * Film grain.
 *
 * The one detail that separates "rendered in a browser" from "shot on a camera":
 * it hides gradient banding and adds texture. Generated as an inline SVG
 * feTurbulence — no asset to ship, no network fetch.
 *
 * Default `blendMode` is `overlay`, which suits a dark ground. A light-canvas
 * brand should switch to `multiply` (bright speckle on light reads as sensor
 * noise, not texture). Keep `opacity` low (0.03–0.06) — grain you can
 * consciously see is too much.
 */
export const NoiseLayer = ({ opacity = 0.05, scale = 0.9, blendMode = 'overlay', seed = 0, style }) => {
  const dataUri = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${scale}" numOctaves="3" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(%23n)"/></svg>`;
    return `url("data:image/svg+xml,${svg.replace(/#/g, '%23').replace(/"/g, "'")}")`;
  }, [scale, seed]);

  return (
    <AbsoluteFill
      style={{
        backgroundImage: dataUri,
        backgroundSize: '240px 240px',
        opacity,
        mixBlendMode: blendMode,
        pointerEvents: 'none',
        zIndex: zIndex.grain,
        ...style,
      }}
    />
  );
};

export default NoiseLayer;
