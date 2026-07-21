#!/usr/bin/env node
/**
 * theme-to-css — generate `src/styles/tailwind.css` from the JS design theme.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * Tailwind needs its tokens as CSS custom properties; the JS theme needs them as
 * values it can interpolate per frame. Those are two representations of one
 * source of truth, and until Phase 5 the CSS one was maintained by hand.
 *
 * It had already drifted: `--color-ms-text-muted` was `rgba(…, 0.48)` in CSS
 * and `0.46` in JS. Nobody noticed, because nothing fails — you just get two
 * slightly different greys depending on which side of the system drew the text.
 * That is the whole argument for generating it.
 *
 * ── WHAT IS AND IS NOT MIRRORED ─────────────────────────────────────────────
 * Colours, font stacks, spacing and radii cross over, because static markup can
 * legitimately use them. Shadows, glows, gradients, blurs and every text style
 * do NOT: they are either animated, computed, or only ever applied from JS, and
 * mirroring them would imply a parity that does not exist.
 *
 * The JS theme stays authoritative. A Tailwind class cannot vary per frame, so
 * anything that animates must come from JS regardless.
 *
 * Usage:  npm run theme:css        (writes the file)
 *         npm run theme:css -- --check   (verifies it is current; exits 1 if not)
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// tokens.js is deliberately pure — no Remotion, no React, no font loading — so
// it can be imported by a plain Node script. See its header.
import { colors, typography, spacing, radii } from '../src/design/theme/tokens.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../src/styles/tailwind.css');

const px = (value) => (typeof value === 'number' ? `${value}px` : value);

const section = (title, lines) => `  /* ${title} */\n${lines.join('\n')}\n`;

const build = () => {
  const colorVars = [
    ['primary', colors.primary],
    ['primary-light', colors.primaryLight],
    ['primary-dark', colors.primaryDark],
    ['secondary', colors.secondary],
    ['accent', colors.accent],
    ['bg', colors.background],
    ['bg-deep', colors.backgroundDeep],
    ['surface', colors.surface],
    ['surface-raised', colors.surfaceRaised],
    ['border', colors.border],
    ['border-strong', colors.borderStrong],
    ['text', colors.text.primary],
    ['text-secondary', colors.text.secondary],
    ['text-muted', colors.text.muted],
    ['text-inverse', colors.text.inverse],
    ['success', colors.success],
    ['warning', colors.warning],
    ['danger', colors.danger],
  ].map(([name, value]) => `  --color-ms-${name}: ${value};`);

  const fontVars = Object.entries(typography.fontStacks).map(
    ([name, stack]) => `  --font-${name}: ${stack};`,
  );

  const spacingVars = Object.entries(spacing).map(
    ([name, value]) => `  --spacing-${name}: ${px(value)};`,
  );

  const radiusVars = Object.entries(radii).map(
    ([name, value]) => `  --radius-${name}: ${px(value)};`,
  );

  return `@import 'tailwindcss';

/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Written by \`scripts/theme-to-css.mjs\` from \`src/design/theme/tokens.js\`.
 * Regenerate with \`npm run theme:css\`; verify with \`npm run theme:css -- --check\`.
 *
 * The JS theme is the source of truth. These variables exist so that static
 * markup can speak the same language as the JS side — anything that animates or
 * is computed per frame must come from JS, because a Tailwind class cannot vary
 * per frame.
 *
 * Shadows, glows, gradients, blurs and text styles are intentionally NOT
 * mirrored: they are applied only from JS, and mirroring them would imply a
 * parity that does not exist.
 */
@theme {
${section('Colors', colorVars)}
${section('Type', fontVars)}
${section('Spacing — 8px base', spacingVars)}
${section('Radii', radiusVars)}}

/* Remotion renders onto a fixed canvas; nothing should ever scroll. */
html,
body,
#video-container {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: var(--color-ms-bg);
}
`;
};

const next = build();
const isCheck = process.argv.includes('--check');

if (isCheck) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (current !== next) {
    console.error(
      'theme-to-css: src/styles/tailwind.css is out of date with the JS theme.\n' +
        '  Run `npm run theme:css` and commit the result.',
    );
    process.exit(1);
  }
  console.log('theme-to-css: tailwind.css is up to date.');
} else {
  writeFileSync(OUT, next, 'utf8');
  console.log(`theme-to-css: wrote ${OUT}`);
}
