/**
 * Brands (Ring 2).
 *
 * One folder per brand. A brand is `extendTheme(tokens, { …overrides })` plus
 * its font loads, validated at module scope — see `editorial/index.js` for the
 * worked example.
 *
 * Brands are listed explicitly rather than discovered from the filesystem:
 * Remotion bundles statically, so a glob would not survive a production render.
 */
export { editorialTheme } from './editorial/index.js';
export { atelierTheme, atelierAmber } from './atelier/index.js';
export { broadcastNight, broadcastDay, terrace } from './broadcast/index.js';
