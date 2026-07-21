import React from 'react';
import { useFormat } from '../hooks/useFormat.js';
import { useResponsive } from '../hooks/useResponsive.js';

/**
 * A centred column capped at a comfortable measure.
 *
 * The default `maxWidth` narrows per format so a line length stays readable:
 * long lines are the fastest way to make a frame look unedited, and an ultrawide
 * canvas will happily run a headline to 3800px if nothing stops it.
 *
 *   <Center><HeroTitle>…</HeroTitle></Center>
 */
const DEFAULT_MEASURE = { ultrawide: 1800, landscape: 1400, square: 900, portrait: 900 };

export const Center = ({
  children,
  maxWidth = DEFAULT_MEASURE,
  gap = 0,
  align = 'center',
  textAlign = 'center',
  style,
}) => {
  const { px } = useFormat();
  const { responsive } = useResponsive();

  const alignment = responsive(align);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: alignment === 'center' ? 'center' : `flex-${alignment}`,
        justifyContent: 'center',
        textAlign: responsive(textAlign),
        gap: px(responsive(gap) ?? 0),
        width: '100%',
        maxWidth: px(responsive(maxWidth)),
        marginLeft: 'auto',
        marginRight: 'auto',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Center;
