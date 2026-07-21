/**
 * Motion Studio Framework — public API (Ring 1).
 *
 * Projects import from `@/framework`, never from deep paths. This barrel is the
 * one place the framework's surface is declared, which keeps the boundary
 * explicit and makes a future extract-to-package a mechanical move.
 *
 * Everything the framework offers is re-exported here and nowhere else. If a
 * symbol is not in this file, it is internal and may change without notice.
 *
 * ── NAMING ──────────────────────────────────────────────────────────────────
 * Static timing tokens carry a `*Tokens` suffix (`cameraTokens`,
 * `transitionTokens`, `ambientTokens`) to distinguish them from the runtime
 * systems of the same name. Everything else is named for what it does.
 */

// ── Motion tokens (static — the timing half of the design system) ────────────
//
// Three of these are renamed on the way out. `camera`, `transitions` and
// `ambient` are TIMING TOKENS, but the framework also exports a camera module, a
// transition registry and ambient presets — so `import { camera }` used to hand
// you a bag of numbers when you almost certainly wanted a camera move. The
// `*Tokens` suffix says which half of the system you are reaching into.
export {
  curves,
  springs,
  durations,
  stagger,
  beats,
  distances,
  ambient as ambientTokens,
  camera as cameraTokens,
  transitions as transitionTokens,
} from './motion/index.js';

// Output formats + structural responsive/z-index tokens
export {
  FPS,
  FORMATS,
  formatFor,
  bucketFor,
  RUNTIMES,
  layout,
  zIndex,
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
} from './formats/index.js';

// Helpers (math, frames, text, number-format, style)
export * from './helpers/index.js';

// The registry idiom — how every named vocabulary resolves, and how packs extend one
export { createRegistry, resolveFrom } from './helpers/registry.js';

// Asset resolution (project-scoped, over staticFile)
export { assetsFor, ASSET_KINDS } from './assets/index.js';

// Pure animation library + mergeMotion
export * from './animations/index.js';

// Camera vocabulary
export {
  cameras,
  resolveCamera,
  registerCamera,
  cameraPush,
  cameraPull,
  cameraPan,
  parallax,
  floatMotion,
  driftMotion,
  handheld,
  zoomTo,
} from './camera/index.js';

// Motion presets + resolver
export { entrances, exits, ambientPresets, resolvePreset } from './presets/index.js';

// React hooks (the only frame-readers)
export * from './hooks/index.js';

// Theme mechanism (visual tokens are injected at runtime by projects)
export { ThemeProvider, useTheme, ThemeContext } from './theme/index.js';

// Component library (brand-agnostic, theme-driven)
export * from './components/index.js';

// Layout system (Scene shell + responsive primitives)
export { Scene, Stack, Center, Split, Grid, FullBleed } from './layouts/index.js';

// Timeline engine (swappable timebases: frames | seconds | bars | your own)
export * from './timeline/index.js';

// Named transition vocabulary (+ TransitionSeries re-exported for assemblers)
export {
  resolveTransition,
  registerTransition,
  TransitionSeries,
  linearTiming,
  springTiming,
} from './transitions/index.js';

// Audio (track-agnostic soundtrack edit)
export * from './audio/index.js';

// Multi-format composition registration
export { registerProject } from './render/index.js';
