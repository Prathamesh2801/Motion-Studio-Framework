import React from 'react';
import { Text } from './Text.jsx';
import { useTheme } from '../../theme/index.js';
import { durations } from '../../motion/index.js';

/**
 * The small monospaced label above a title ("01 — OUR PRODUCTS").
 * A cheap, reliable way to make a scene look editorially designed.
 */
export const Eyebrow = ({ children, color, delay = 0, duration = durations.fast, preset = 'rise', ...rest }) => {
  const theme = useTheme();
  return (
    <Text
      as="span"
      variant="eyebrow"
      color={color ?? theme.colors.primary}
      motion={{ preset, delay, duration }}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Eyebrow;
