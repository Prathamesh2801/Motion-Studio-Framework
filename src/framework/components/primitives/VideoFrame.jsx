import React from 'react';
import { OffthreadVideo } from 'remotion';
import { useTheme } from '../../theme/index.js';
import { useMotion, useAmbientMotion } from '../../hooks/useMotion.js';
import { mergeMotion } from '../../animations/merge.js';
import { durations } from '../../motion/index.js';

/**
 * A framed video clip with the studio's standard treatment — the `MediaFrame`
 * of moving footage. Same framed/cutout split, same entrance/ambient wiring;
 * the difference is `OffthreadVideo` instead of `Img` and a `volume` passthrough
 * for productions that mix in a clip's native audio.
 *
 * Deliberately dumb about content: it frames and plays a clip. Anything that
 * treats footage as an optical surface (distortion, masking, focus) is
 * project-local until a second production needs it — see docs/EXTENDING.md.
 */
export const VideoFrame = ({
  src,
  variant = 'framed',
  radius,
  fit = 'cover',
  startFrom,
  endAt,
  volume = 0,
  playbackRate = 1,
  preset = 'settle',
  delay = 0,
  duration = durations.slow,
  ambient = 'none',
  ambientOptions = {},
  style,
  videoStyle,
}) => {
  const theme = useTheme();
  const entrance = useMotion({ preset, delay, duration });
  const ambientStyle = useAmbientMotion({ preset: ambient, ...ambientOptions });

  const isCutout = variant === 'cutout';
  const cornerRadius = radius ?? theme.radii.lg;

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
      <OffthreadVideo
        src={src}
        startFrom={startFrom}
        endAt={endAt}
        volume={volume}
        playbackRate={playbackRate}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: fit,
          ...videoStyle,
        }}
      />
    </div>
  );
};

export default VideoFrame;
