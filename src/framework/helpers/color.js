/** Colour helpers. Pure and dependency-free, usable at theme-build or render time. */

/**
 * Translucent colour from a hex string, e.g. `alpha('#6366f1', 0.2)`.
 * Accepts 3- or 6-digit hex. Non-hex input is returned unchanged so callers can
 * pass an already-rgba() value through without special-casing.
 */
export const alpha = (hex, amount) => {
  if (typeof hex !== 'string' || hex[0] !== '#') return hex;
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${amount})`;
};
