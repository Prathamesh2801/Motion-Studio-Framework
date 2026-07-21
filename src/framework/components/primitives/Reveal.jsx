import React from 'react';
import { useMotion } from '../../hooks/useMotion.js';
import { durations } from '../../motion/index.js';

/**
 * Wraps any children in a motion preset — the workhorse of the system. Rather
 * than every component implementing its own entrance, wrap it.
 *
 *   <Reveal preset="depth" delay={12}><MediaCard {...item} /></Reveal>
 */
export const Reveal = ({
  children,
  preset = 'rise',
  delay = 0,
  duration = durations.base,
  exitPreset,
  exitAt,
  exitDuration,
  as: Tag = 'div',
  style,
  ...rest
}) => {
  const motionStyle = useMotion({ preset, delay, duration, exitPreset, exitAt, exitDuration, ...rest });
  return <Tag style={{ ...motionStyle, ...style }}>{children}</Tag>;
};

export default Reveal;
