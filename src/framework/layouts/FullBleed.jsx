import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useTheme } from '../theme/index.js';
import { useFormat } from '../hooks/useFormat.js';
import { useResponsive } from '../hooks/useResponsive.js';
import { alpha } from '../helpers/color.js';
import { zIndex } from '../formats/index.js';

/**
 * Edge-to-edge media with content anchored on top.
 *
 * The `scrim` is the load-bearing part: type over uncontrolled imagery is
 * illegible without one, and a scrim is a LAYOUT concern rather than something
 * each scene should hand-roll. It is drawn from the theme background so it suits
 * whichever brand is active.
 *
 *   <FullBleed media={<Img src={…} />} scrim="bottom" anchor="bottom-left">
 *     <SectionHeader … />
 *   </FullBleed>
 */
const ANCHORS = {
  center: { alignItems: 'center', justifyContent: 'center' },
  'top-left': { alignItems: 'flex-start', justifyContent: 'flex-start' },
  'top-right': { alignItems: 'flex-end', justifyContent: 'flex-start' },
  'bottom-left': { alignItems: 'flex-start', justifyContent: 'flex-end' },
  'bottom-right': { alignItems: 'flex-end', justifyContent: 'flex-end' },
  bottom: { alignItems: 'center', justifyContent: 'flex-end' },
  top: { alignItems: 'center', justifyContent: 'flex-start' },
};

export const FullBleed = ({
  children,
  media,
  scrim = 'bottom',
  scrimStrength = 0.85,
  anchor = 'bottom-left',
  padded = true,
  style,
  contentStyle,
}) => {
  const theme = useTheme();
  const { gutter, safeTop, safeBottom } = useFormat();
  const { responsive } = useResponsive();

  const base = theme.colors.background;
  const scrims = {
    none: null,
    bottom: `linear-gradient(180deg, ${alpha(base, 0)} 35%, ${alpha(base, scrimStrength)} 100%)`,
    top: `linear-gradient(0deg, ${alpha(base, 0)} 35%, ${alpha(base, scrimStrength)} 100%)`,
    full: `linear-gradient(180deg, ${alpha(base, scrimStrength * 0.7)} 0%, ${alpha(base, scrimStrength * 0.35)} 50%, ${alpha(base, scrimStrength)} 100%)`,
    /** For type placed over the left half of a wide image. */
    left: `linear-gradient(90deg, ${alpha(base, scrimStrength)} 0%, ${alpha(base, 0)} 65%)`,
  };

  const wash = scrims[responsive(scrim)] ?? null;
  const placement = ANCHORS[responsive(anchor)] ?? ANCHORS.center;

  return (
    <AbsoluteFill style={{ isolation: 'isolate', ...style }}>
      <AbsoluteFill style={{ zIndex: zIndex.media, overflow: 'hidden' }}>{media}</AbsoluteFill>

      {wash ? <AbsoluteFill style={{ zIndex: zIndex.glow, background: wash, pointerEvents: 'none' }} /> : null}

      <AbsoluteFill
        style={{
          zIndex: zIndex.content,
          display: 'flex',
          flexDirection: 'column',
          ...placement,
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
  );
};

export default FullBleed;
