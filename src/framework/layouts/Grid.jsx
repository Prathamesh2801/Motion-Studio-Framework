import React from 'react';
import { useFormat } from '../hooks/useFormat.js';
import { useResponsive } from '../hooks/useResponsive.js';

/**
 * A responsive grid that drops columns as the canvas narrows.
 *
 * The default column counts are chosen per bucket so a set of cards stays
 * readable everywhere — four across an ultrawide banner, one down a phone.
 * Override with a scalar or a per-bucket map.
 *
 *   <Grid><StatCard/><StatCard/><StatCard/></Grid>
 *   <Grid columns={{ landscape: 4, portrait: 2 }} gap={24}>…</Grid>
 */
const DEFAULT_COLUMNS = { ultrawide: 4, landscape: 3, square: 2, portrait: 1 };

export const Grid = ({
  children,
  columns = DEFAULT_COLUMNS,
  gap = { landscape: 32, vertical: 24 },
  align = 'stretch',
  style,
}) => {
  const { px } = useFormat();
  const { responsive } = useResponsive();

  const count = Math.max(1, Math.round(responsive(columns) ?? 1));
  const spacing = px(responsive(gap) ?? 0);

  return (
    <div
      style={{
        display: 'grid',
        // minmax(0, 1fr) rather than 1fr: without the zero minimum, a long word
        // or a wide child expands its track and breaks the equal-column grid.
        gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
        gap: spacing,
        alignItems: responsive(align),
        width: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Grid;
