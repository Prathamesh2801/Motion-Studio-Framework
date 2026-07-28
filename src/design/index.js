/**
 * Design ring (Ring 2) — themeable visual system.
 *
 * Owns the theme contract, the default theme, and (later) per-brand presets and
 * font loaders. Depends on the framework (Ring 1); the framework never depends
 * on it — the visual theme flows into components at runtime via <ThemeProvider>.
 */
export { defaultTheme, extendTheme, validateTheme } from './theme/index.js';
export { loadFonts, loadFace, registerFace, FONT_FACES, systemStacks } from './fonts/index.js';
export {
  editorialTheme,
  atelierTheme,
  atelierAmber,
  broadcastNight,
  broadcastDay,
  terrace,
} from './brands/index.js';
