import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AnimatedBackground } from '../components/layers/AnimatedBackground.jsx';
import { FilmOverlay } from '../components/layers/FilmOverlay.jsx';
import { useFormat } from '../hooks/useFormat.js';
import { useSceneProgress } from '../hooks/useSceneProgress.js';
import { resolveCamera } from '../camera/index.js';
import { camera as cameraTokens } from '../motion/index.js';

/**
 * The frame every scene sits in.
 *
 * Composes the three passes in order — atmosphere behind, content in the middle,
 * film treatment in front — and owns the two things no scene should
 * re-implement: format-correct safe margins, and a slow camera move that keeps a
 * shot from ever being fully static.
 *
 * Camera is selected by name from the camera registry (`camera="push"` by
 * default; `"drift"`, `"handheld"`, `"static"`, …). `push` sets the push amount
 * for the default move; set `camera="static"` or `push={0}` to lock it off.
 */
export const Scene = ({
  children,
  /** Atmosphere recipe name from `layers/backgrounds.js`. */
  background = 'studio',
  backgroundOverrides,
  grain,
  vignette,
  /** Named camera move. */
  camera = 'push',
  /** Push amount for the default push camera. 0 disables movement. */
  push = cameraTokens.pushScale,
  pushOrigin = 'center',
  /** Set false for full-bleed scenes that manage their own padding. */
  padded = true,
  align = 'center',
  justify = 'center',
  direction = 'column',
  style,
  contentStyle,
}) => {
  const { gutter, safeTop, safeBottom } = useFormat();
  const { frame, durationInFrames, fps } = useSceneProgress();

  const cameraFn = resolveCamera(camera);
  const cameraStyle =
    push === 0 && camera === 'push'
      ? {}
      : cameraFn({ frame, fps, duration: durationInFrames, amount: push, origin: pushOrigin });

  return (
    <AbsoluteFill style={style}>
      <AnimatedBackground variant={background} overrides={backgroundOverrides} />

      <AbsoluteFill style={cameraStyle}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: direction,
            alignItems: align,
            justifyContent: justify,
            paddingLeft: padded ? gutter : 0,
            paddingRight: padded ? gutter : 0,
            paddingTop: padded ? safeTop : 0,
            paddingBottom: padded ? safeBottom : 0,
            ...contentStyle,
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>

      <FilmOverlay variant={background} overrides={backgroundOverrides} grain={grain} vignette={vignette} />
    </AbsoluteFill>
  );
};

export default Scene;
