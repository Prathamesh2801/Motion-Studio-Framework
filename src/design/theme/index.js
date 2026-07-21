/**
 * Design theme (Ring 2) — the visual token values injected at runtime through
 * the framework's <ThemeProvider>. Import the default theme (or a brand that
 * extends it) and hand it to the provider; components read it via useTheme().
 */
export { defaultTheme } from './default.js';
export { extendTheme, validateTheme } from './contract.js';
