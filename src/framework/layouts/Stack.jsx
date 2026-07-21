import React from 'react';
import { useFormat } from '../hooks/useFormat.js';
import { useResponsive } from '../hooks/useResponsive.js';

/**
 * The base flow container: a flex row or column with a consistent gap.
 *
 * Every sizing prop accepts either a scalar or a responsive map, so per-format
 * decisions are authored as DATA here rather than as `if (isVertical)` branches
 * in a scene:
 *
 *   <Stack gap={{ landscape: 40, vertical: 64 }} direction={{ landscape: 'row', vertical: 'column' }}>
 *
 * Layouts are content-agnostic — they arrange whatever children they are given
 * and never inspect them.
 */
export const Stack = ({
  children,
  direction = 'column',
  gap = 0,
  align,
  justify,
  wrap = false,
  maxWidth,
  fill = true,
  style,
}) => {
  const { px } = useFormat();
  const { responsive } = useResponsive();

  const width = responsive(maxWidth);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: responsive(direction),
        gap: px(responsive(gap) ?? 0),
        alignItems: responsive(align),
        justifyContent: responsive(justify),
        flexWrap: responsive(wrap) ? 'wrap' : 'nowrap',
        width: fill ? '100%' : undefined,
        maxWidth: width === undefined ? undefined : px(width),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Stack;
