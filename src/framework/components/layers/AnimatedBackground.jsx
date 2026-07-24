import React from 'react';
import { AbsoluteFill } from 'remotion';
import { GradientLayer } from './GradientLayer.jsx';
import { GlowLayer } from './GlowLayer.jsx';
import { GridLayer } from './GridLayer.jsx';
import { DustLayer } from './DustLayer.jsx';
import { getBackground } from './backgrounds.js';
import { useTheme } from '../../theme/index.js';

/**
 * The layers BEHIND a scene's content: canvas gradient, optional technical grid,
 * and the drifting brand lights.
 *
 * `isolation: isolate` is load-bearing — it gives the child layers their own
 * stacking context. Without it their `z-index` values would resolve against the
 * parent scene and the opaque gradient would paint over the content. The
 * vignette and grain live in `FilmOverlay`, which sits in front.
 */
export const AnimatedBackground = ({ variant = 'studio', overrides, children, style }) => {
  const theme = useTheme();
  const config = getBackground(theme, variant, overrides);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.background, isolation: 'isolate', ...style }}>
      <GradientLayer gradient={config.gradient} />
      {config.grid ? <GridLayer /> : null}
      {config.glows.map((glow, index) => (
        <GlowLayer key={`glow-${index}`} {...glow} />
      ))}
      {config.dust.map((dust, index) => (
        <DustLayer key={`dust-${index}`} {...dust} />
      ))}
      {children}
    </AbsoluteFill>
  );
};

export default AnimatedBackground;
