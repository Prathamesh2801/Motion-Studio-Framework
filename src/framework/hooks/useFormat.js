import { useVideoConfig } from 'remotion';
import { useMemo } from 'react';
import { formatFor, bucketFor, layout } from '../formats/index.js';

/**
 * Format awareness for components.
 *
 * Returns the active format token plus `px()`, which converts any design-system
 * value (authored at 1920x1080) into the current canvas's pixels. Components
 * should wrap every hardcoded-looking number in `px()` so one composition works
 * across landscape, reel, square, exhibition and ultrawide outputs.
 *
 * `bucket` is the 4-way responsive shape (`landscape | portrait | square |
 * ultrawide`); prefer `useResponsive` for picking per-bucket values, and keep
 * `isPortrait`/`isSquare`/etc. here for simple boolean branches.
 */
export const useFormat = () => {
  const { width, height, fps, durationInFrames } = useVideoConfig();

  return useMemo(() => {
    const format = formatFor(width, height);
    const bucket = bucketFor(width, height);
    const aspect = width / height;

    const px = (value) => value * format.scale;

    const isPortrait = bucket === 'portrait';
    const isSquare = bucket === 'square';
    const isUltrawide = bucket === 'ultrawide';
    const isLandscape = bucket === 'landscape';
    /** Any tall/near-square social shape — the common "stack it" branch. */
    const isVertical = isPortrait || isSquare;

    return {
      format,
      bucket,
      width,
      height,
      fps,
      durationInFrames,
      aspect,
      isPortrait,
      isSquare,
      isUltrawide,
      isLandscape,
      isVertical,
      social: format.social,
      scale: format.scale,
      px,
      /** Horizontal padding appropriate to the format. */
      gutter: px(isVertical ? layout.gutterCompact : layout.gutter),
      /** Vertical padding, expanded on social formats for platform UI. */
      safeTop: px(format.social ? layout.socialSafeTop : layout.gutter / 2),
      safeBottom: px(format.social ? layout.socialSafeBottom : layout.gutter / 2),
    };
  }, [width, height, fps, durationInFrames]);
};

export default useFormat;
