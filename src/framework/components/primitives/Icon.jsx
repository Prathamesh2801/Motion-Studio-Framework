import React from 'react';
import { useTheme } from '../../theme/index.js';
import { useFormat } from '../../hooks/useFormat.js';

/**
 * A small, deliberately CLOSED set of line icons.
 *
 * Not a wrapper around an icon library: the same argument that keeps the preset
 * vocabulary small applies here. A few consistent glyphs are a brand; five
 * hundred arbitrary ones are clip art. Add a glyph when a film needs it, and
 * draw it to match — 24-unit grid, round caps/joins, stroke-only (no fills), so
 * it reads at the same weight as the type beside it.
 */
const GLYPHS = {
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-9.4 6.27a2 2 0 0 1-2.2 0L1 7" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
};

export const Icon = ({ name, size = 24, color, strokeWidth = 1.75, style }) => {
  const theme = useTheme();
  const { px } = useFormat();
  const glyph = GLYPHS[name];
  if (!glyph) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width={px(size)}
      height={px(size)}
      fill="none"
      stroke={color ?? theme.colors.text.secondary}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      {glyph}
    </svg>
  );
};

export default Icon;
