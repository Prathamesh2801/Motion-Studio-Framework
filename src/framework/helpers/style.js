/** Style-object plumbing shared by components. */

/** Joins truthy class names — a tiny local `clsx`. */
export const cx = (...parts) => parts.filter(Boolean).join(' ');

/** Builds a `transform` string from parts, skipping no-op values. */
export const transform = ({
  x = 0,
  y = 0,
  z = 0,
  scale,
  scaleX,
  scaleY,
  rotate = 0,
  rotateX = 0,
  rotateY = 0,
  skew = 0,
} = {}) => {
  const parts = [];
  if (x || y || z) parts.push(`translate3d(${x}px, ${y}px, ${z}px)`);
  if (scale !== undefined) parts.push(`scale(${scale})`);
  if (scaleX !== undefined) parts.push(`scaleX(${scaleX})`);
  if (scaleY !== undefined) parts.push(`scaleY(${scaleY})`);
  if (rotate) parts.push(`rotate(${rotate}deg)`);
  if (rotateX) parts.push(`rotateX(${rotateX}deg)`);
  if (rotateY) parts.push(`rotateY(${rotateY}deg)`);
  if (skew) parts.push(`skewX(${skew}deg)`);
  return parts.length > 0 ? parts.join(' ') : 'none';
};

/** Composes an existing transform with new parts, preserving order. */
export const composeTransform = (...values) =>
  values.filter((v) => v && v !== 'none').join(' ') || 'none';

/** Removes `undefined` keys so callers can spread optional style props. */
export const compactStyle = (style) =>
  Object.fromEntries(Object.entries(style).filter(([, v]) => v !== undefined));
