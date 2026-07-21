import { useResponsive } from '@/framework';

/**
 * Shared helpers for scene templates. Internal — not part of the template API.
 */

/**
 * The house editorial alignment: left on wide canvases, centred once the layout
 * stacks. Templates accept an `align` override, which may itself be a
 * per-bucket map.
 */
export const useEditorialAlign = (override) => {
  const { responsive } = useResponsive();
  return responsive(override ?? { landscape: 'left', ultrawide: 'left', vertical: 'center' });
};

/** Flexbox cross-axis value for an alignment keyword. */
export const flexAlign = (align) => (align === 'center' ? 'center' : `flex-${align === 'right' ? 'end' : 'start'}`);
