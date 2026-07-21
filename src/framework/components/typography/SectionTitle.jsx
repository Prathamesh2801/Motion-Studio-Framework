import React from 'react';
import { Text } from './Text.jsx';
import { useTheme } from '../../theme/index.js';
import { durations } from '../../motion/index.js';

/** Headline for a scene or chapter. Sits under an `Eyebrow` in `SectionHeader`. */
export const SectionTitle = ({ children, gradient = false, delay = 0, duration = durations.slow, preset = 'unmask', ...rest }) => {
  const theme = useTheme();
  return (
    <Text
      as="h2"
      variant="sectionTitle"
      gradient={gradient ? theme.colors.gradients.text : undefined}
      motion={{ preset, delay, duration }}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default SectionTitle;
