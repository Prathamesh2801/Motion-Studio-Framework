import React from 'react';
import { Text } from './Text.jsx';
import { useTheme } from '../../theme/index.js';
import { durations } from '../../motion/index.js';

/**
 * Body copy. Capped at a comfortable measure by default — long lines are the
 * fastest way to make a video look unedited.
 */
export const Description = ({ children, color, delay = 0, duration = durations.base, preset = 'rise', maxWidth = 820, ...rest }) => {
  const theme = useTheme();
  return (
    <Text
      as="p"
      variant="description"
      color={color ?? theme.colors.text.secondary}
      maxWidth={maxWidth}
      motion={{ preset, delay, duration }}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Description;
