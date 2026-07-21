import React, { Children } from 'react';
import { useFormat } from '../hooks/useFormat.js';
import { useResponsive } from '../hooks/useResponsive.js';

/**
 * Two slots side by side that STACK on vertical formats.
 *
 * This is the layout the reference implementation kept re-implementing by hand
 * in every scene. Here the reflow is decided once: a row on landscape and
 * ultrawide, a column on portrait and square.
 *
 *   <Split><MediaFrame … /><Description>…</Description></Split>
 *   <Split ratio={[2, 3]} gap={80}>…</Split>
 *
 * Accepts either two children or explicit `start`/`end` slots. `reverseWhenStacked`
 * puts the second slot first once stacked — useful when the media should lead on
 * a phone but trail on desktop.
 */
export const Split = ({
  children,
  start,
  end,
  ratio = [1, 1],
  gap = { landscape: 80, vertical: 56 },
  align = 'center',
  justify = 'space-between',
  direction,
  reverseWhenStacked = false,
  style,
}) => {
  const { px, isVertical } = useFormat();
  const { responsive } = useResponsive();

  const slots = start !== undefined || end !== undefined ? [start, end] : Children.toArray(children);
  const [first, second] = slots;

  // `isVertical` from useFormat, not a hand-rolled bucket comparison: the
  // definition of "vertical" must live in exactly one place, or a new bucket
  // gets added and only some of the layouts learn about it.
  const flow = responsive(direction) ?? (isVertical ? 'column' : 'row');
  const stacked = flow === 'column';
  const [firstRatio, secondRatio] = responsive(ratio) ?? [1, 1];

  const ordered = stacked && reverseWhenStacked ? [second, first] : [first, second];
  const ratios = stacked && reverseWhenStacked ? [secondRatio, firstRatio] : [firstRatio, secondRatio];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: flow,
        alignItems: responsive(align),
        justifyContent: responsive(justify),
        gap: px(responsive(gap) ?? 0),
        width: '100%',
        ...style,
      }}
    >
      {ordered.map((slot, index) => (
        <div
          key={index}
          style={{
            // Stacked slots share the full width; side-by-side slots share the
            // row by ratio. minWidth:0 stops long text forcing an overflow.
            flex: stacked ? '0 0 auto' : `${ratios[index]} 1 0`,
            width: stacked ? '100%' : undefined,
            minWidth: 0,
          }}
        >
          {slot}
        </div>
      ))}
    </div>
  );
};

export default Split;
