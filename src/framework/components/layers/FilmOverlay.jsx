import React from 'react';
import { AbsoluteFill } from 'remotion';
import { VignetteLayer } from './VignetteLayer.jsx';
import { NoiseLayer } from './NoiseLayer.jsx';
import { getBackground } from './backgrounds.js';
import { useTheme } from '../../theme/index.js';

/**
 * The finishing pass, ABOVE the content: edge vignette and film grain. Applying
 * these over the type — not just the background — is what makes a frame look
 * photographed rather than composited.
 *
 * Deliberately NOT isolated: the grain's blend mode has to see the content
 * beneath it, otherwise it composites against nothing.
 */
export const FilmOverlay = ({ variant = 'studio', overrides, vignette, grain, style }) => {
  const theme = useTheme();
  const config = getBackground(theme, variant, overrides);
  const vignetteStrength = vignette ?? config.vignette;
  const grainOpacity = grain ?? config.grain;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', ...style }}>
      {vignetteStrength ? <VignetteLayer strength={vignetteStrength} color={config.vignetteColor} /> : null}
      {grainOpacity ? <NoiseLayer opacity={grainOpacity} blendMode={config.grainBlend} /> : null}
    </AbsoluteFill>
  );
};

export default FilmOverlay;
