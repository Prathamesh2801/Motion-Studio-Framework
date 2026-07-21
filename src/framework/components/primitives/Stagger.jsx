import React, { Children } from 'react';
import { useStaggeredMotion } from '../../hooks/useMotion.js';
import { durations, stagger as staggerTokens } from '../../motion/index.js';
import { useFormat } from '../../hooks/useFormat.js';

/**
 * Animates its children in sequence, and owns the flex layout — a staggered
 * group is nearly always a row or column with a consistent gap.
 *
 *   <Stagger preset="rise" step={4} gap={theme.spacing.md}>
 *     {items.map((it) => <FeatureItem key={it.id} {...it} />)}
 *   </Stagger>
 */
export const Stagger = ({
  children,
  preset = 'rise',
  delay = 0,
  step = staggerTokens.base,
  duration = durations.base,
  from = 'start',
  direction = 'column',
  gap = 0,
  align,
  justify,
  style,
  itemStyle,
  ...rest
}) => {
  const items = Children.toArray(children);
  const { px } = useFormat();
  const motionAt = useStaggeredMotion({ count: items.length, preset, delay, step, duration, from, ...rest });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        gap: px(gap),
        alignItems: align,
        justifyContent: justify,
        ...style,
      }}
    >
      {items.map((child, index) => (
        <div key={child.key ?? index} style={{ ...motionAt(index), ...itemStyle }}>
          {child}
        </div>
      ))}
    </div>
  );
};

export default Stagger;
