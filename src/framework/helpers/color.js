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

const channels = (hex) => {
  if (typeof hex !== 'string' || hex[0] !== '#') return null;
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  if (full.length !== 6) return null;
  const int = parseInt(full, 16);
  return Number.isNaN(int) ? null : [(int >> 16) & 255, (int >> 8) & 255, int & 255];
};

/**
 * Blend two hex colours. `amount` is how far to travel from `from` to `to`.
 *
 * Exists because a theme colour supplied as DATA (a club's shade, a product's
 * accent) still has to produce the derived tones a design system needs — a
 * gradient's second stop, a hover state. Without it, a data-driven accent can
 * only ever be a flat fill, and every gradient in the theme keeps the brand's
 * original colour, which reads as a bug rather than a brand.
 *
 * Non-hex input returns `from` unchanged, matching `alpha`'s pass-through.
 */
export const mix = (from, to, amount = 0.5) => {
  const a = channels(from);
  const b = channels(to);
  if (!a || !b) return from;
  const t = Math.min(1, Math.max(0, amount));
  const channel = (index) => Math.round(a[index] + (b[index] - a[index]) * t);
  return `#${[0, 1, 2]
    .map((i) => channel(i).toString(16).padStart(2, '0'))
    .join('')}`;
};

/** Lighten toward white / darken toward black. Thin wrappers over `mix`. */
export const lighten = (hex, amount = 0.2) => mix(hex, '#ffffff', amount);
export const darken = (hex, amount = 0.2) => mix(hex, '#000000', amount);
