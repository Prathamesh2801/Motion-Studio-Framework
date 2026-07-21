import React from 'react';
import { Text } from './Text.jsx';
import { useTheme } from '../../theme/index.js';
import { durations } from '../../motion/index.js';

/**
 * The single largest piece of type in a video. One per composition.
 * Defaults to the masked reveal — the signature "premium" headline entrance.
 */
export const HeroTitle = ({ children, gradient = false, delay = 0, duration = durations.slow, preset = 'unmask', ...rest }) => {
  const theme = useTheme();
  return (
    <Text
      as="h1"
      variant="hero"
      gradient={gradient ? theme.colors.gradients.text : undefined}
      motion={{ preset, delay, duration }}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default HeroTitle;
