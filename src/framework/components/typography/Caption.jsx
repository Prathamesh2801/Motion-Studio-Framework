import React from 'react';
import { Text } from './Text.jsx';
import { useTheme } from '../../theme/index.js';
import { durations } from '../../motion/index.js';

/** Small print: disclaimers, credits, image labels. */
export const Caption = ({ children, color, delay = 0, duration = durations.fast, preset = 'fade', ...rest }) => {
  const theme = useTheme();
  return (
    <Text
      as="span"
      variant="caption"
      color={color ?? theme.colors.text.muted}
      motion={{ preset, delay, duration }}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Caption;
