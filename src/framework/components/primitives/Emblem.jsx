import React from 'react';
import { Img } from 'remotion';
import { useFormat } from '../../hooks/useFormat.js';
import { useMotion } from '../../hooks/useMotion.js';
import { durations } from '../../motion/index.js';

/**
 * A logotype: a crest, a flag, a badge, a partner mark.
 *
 * Neither of the two existing image paths fits this job. `Icon` is a closed set
 * of drawn glyphs, not a file. `MediaFrame` is photography treatment — a frame,
 * a shadow, a Ken Burns push — and applying it to a club crest gives you a
 * slowly zooming logo in a rounded box, which is wrong in a way that is hard to
 * unsee.
 *
 * So the defaults here are the opposite of MediaFrame's: `contain`, no crop, no
 * zoom, no frame. **Cropping a logotype is the fastest way to make a real brand
 * look counterfeit**, and it is what `cover` does to any mark that is not
 * square. `box` reserves the same square for every emblem so a row of crests
 * with different aspect ratios still sits on one baseline.
 */
export const Emblem = ({
  src,
  alt = '',
  /** Edge of the square the mark is fitted inside, in design px. */
  size = 48,
  fit = 'contain',
  preset = 'settle',
  delay = 0,
  duration = durations.base,
  style,
  imgStyle,
}) => {
  const { px } = useFormat();
  const motionStyle = useMotion({ preset, delay, duration });

  if (!src) return null;

  return (
    <div
      style={{
        width: px(size),
        height: px(size),
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...motionStyle,
        ...style,
      }}
    >
      <Img
        src={src}
        alt={alt}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: fit === 'cover' ? '100%' : undefined,
          height: fit === 'cover' ? '100%' : undefined,
          objectFit: fit,
          display: 'block',
          ...imgStyle,
        }}
      />
    </div>
  );
};

export default Emblem;
