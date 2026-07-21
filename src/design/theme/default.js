import { validateTheme } from './contract.js';
import { loadFonts } from '../fonts/index.js';
import { tokens, FONT_SPEC } from './tokens.js';

/**
 * The default theme (Ring 2) — a neutral, brand-agnostic DARK system.
 *
 * This file is deliberately thin. The token VALUES live in `tokens.js` (pure, so
 * the `theme-to-css` codegen can read them in plain Node); this file does the
 * two things that have side effects or need the runtime:
 *
 *   1. Triggers the webfont load. `loadFonts` opens Remotion `delayRender()`
 *      handles at module scope, so no frame renders until the faces are ready.
 *      The returned stacks are the same strings `tokens.js` derived purely —
 *      `loadFace` asserts that, so the two cannot drift.
 *   2. Validates the assembled theme against the contract.
 */

// Called for its loading side effect. The stacks it returns are already in
// `tokens.typography.fontStacks`; `loadFace` throws if they ever disagree.
loadFonts(FONT_SPEC);

/** The complete visual theme object, consumed via `useTheme()`. */
export const defaultTheme = validateTheme({ name: 'default-dark', ...tokens });

// NOTE: validation runs HERE, at theme-definition time, rather than inside
// <ThemeProvider>. Two reasons. First, the ring rule: ThemeProvider is Ring 1
// and the contract is Ring 2, so the provider importing the validator would
// invert the dependency direction the whole architecture rests on. Second, this
// is simply better — it runs once at import, in every environment, and a broken
// brand fails when it is defined rather than when it is first rendered.

// Re-exported for brands that want to compose from individual groups rather than
// override through `extendTheme`.
export {
  colors,
  typography,
  fontStacks,
  spacing,
  radii,
  shadows,
  dropShadows,
  glows,
  strokes,
  blurs,
  tokens,
} from './tokens.js';
