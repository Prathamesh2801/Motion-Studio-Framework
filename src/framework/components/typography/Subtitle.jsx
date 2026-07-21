import React from 'react';
import { Text } from './Text.jsx';
import { useTheme } from '../../theme/index.js';
import { durations } from '../../motion/index.js';

/** Supporting line directly beneath a title. */
export const Subtitle = ({ children, color, delay = 0, duration = durations.base, preset = 'rise', ...rest }) => {
  const theme = useTheme();
  return (
    <Text
      as="p"
      variant="subtitle"
      color={color ?? theme.colors.text.secondary}
      motion={{ preset, delay, duration }}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Subtitle;
