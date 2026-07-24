import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
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
 *
 * `animated` re-seeds the noise every `cycleFrames` frames, so the texture
 * itself changes over time instead of sitting as one fixed pattern — real
 * grain is temporal, not a static overlay. The re-seed is a pure function of
 * `frame` (never `Math.random()`), so it stays reproducible across concurrent
 * render workers.
 *
 * `cycleFrames` defaults to 1 — re-seeding every frame, matching how real film
 * grain actually behaves (each photochemical frame has independent grain).
 * Measured, not assumed: at 2+ the re-seed reads as a "hold, then jump" pulse
 * (confirmed by diffing consecutive rendered frames — cycleFrames=1 gives a
 * near-constant frame-to-frame delta, cycleFrames>=2 gives a bursty one), and
 * at 1 the per-frame cost is within normal render-time variance.
 */
export const NoiseLayer = ({
  opacity = 0.05,
  scale = 0.9,
  blendMode = 'overlay',
  seed = 0,
  animated = true,
  cycleFrames = 1,
  style,
}) => {
  const frame = useCurrentFrame();
  const effectiveSeed = animated ? seed + Math.floor(frame / cycleFrames) : seed;

  const dataUri = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${scale}" numOctaves="3" seed="${effectiveSeed}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(%23n)"/></svg>`;
    return `url("data:image/svg+xml,${svg.replace(/#/g, '%23').replace(/"/g, "'")}")`;
  }, [scale, effectiveSeed]);

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
