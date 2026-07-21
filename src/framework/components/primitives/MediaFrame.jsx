import React from 'react';
import { Img } from 'remotion';
import { useTheme } from '../../theme/index.js';
import { useMotion, useAmbientMotion } from '../../hooks/useMotion.js';
import { useSceneProgress } from '../../hooks/useSceneProgress.js';
import { zoomTo } from '../../camera/index.js';
import { mergeMotion } from '../../animations/merge.js';
import { durations } from '../../motion/index.js';

/**
 * A framed image with the studio's standard treatment: rounded corners, an
 * inner hairline, a drop shadow, an entrance and an optional slow zoom.
 *
 * Use `variant="cutout"` for transparent PNG renders — those want a shadow and
 * levitation but no frame. A cutout's shadow follows its alpha (a drop-shadow
 * filter on the image), never a box-shadow, which would paint a slab.
 */
export const MediaFrame = ({
  src,
  alt = '',
  variant = 'framed',
  radius,
  fit = 'cover',
  /** Slow zoom across the scene. 0 disables it. */
  kenBurns = 0.08,
  focal = { x: 50, y: 50 },
  preset = 'settle',
  delay = 0,
  duration = durations.slow,
  ambient = 'none',
  ambientOptions = {},
  style,
  imgStyle,
}) => {
  const theme = useTheme();
  const { frame, durationInFrames } = useSceneProgress();
  const entrance = useMotion({ preset, delay, duration });
  const ambientStyle = useAmbientMotion({ preset: ambient, ...ambientOptions });

  const isCutout = variant === 'cutout';
  const cornerRadius = radius ?? theme.radii.lg;
  const zoom = kenBurns
    ? zoomTo({ frame, duration: durationInFrames, scale: 1 + kenBurns, focal, easing: 'smooth' })
    : {};

  return (
    <div
      style={{
        position: 'relative',
        overflow: isCutout ? 'visible' : 'hidden',
        borderRadius: isCutout ? 0 : cornerRadius,
        background: isCutout ? 'transparent' : theme.colors.surface,
        boxShadow: isCutout ? 'none' : `${theme.shadows.lg}, ${theme.strokes.inset}`,
        ...mergeMotion(entrance, ambientStyle),
        ...style,
      }}
    >
      <Img
        src={src}
        alt={alt}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: fit,
          filter: isCutout ? theme.dropShadows.product : undefined,
          ...zoom,
          ...imgStyle,
        }}
      />
    </div>
  );
};

export default MediaFrame;
