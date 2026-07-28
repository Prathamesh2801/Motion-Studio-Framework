/**
 * @motion/runtime — the public SDK.
 *
 * The Motion Runtime executes templates authored in Motion Studio. It is the
 * product; the editor and Remotion Studio are two of its consumers, and an
 * external React application is a third.
 *
 *   import { PlayerStatsTemplate } from '@motion/runtime';
 *
 *   <PlayerStatsTemplate data={player} />
 *
 * ── WHAT A CONSUMER NEVER TOUCHES ───────────────────────────────────────────
 * `PackHost`, `resolvePack`, `withTheme`, the ViewModel, the timeline engine,
 * format tokens, `<Player>` and Remotion itself. All of it runs underneath.
 * None of it appears in this file's exports, and that omission is the API: the
 * runtime is free to change any of those without breaking a consumer.
 *
 * ── WHAT IS DELIBERATELY NOT HERE ───────────────────────────────────────────
 * No MP4 rendering. Rendering needs a Node process and a headless browser; a
 * browser tab cannot do it, and an SDK function that pretended otherwise would
 * be a lie with a spinner. Rendering stays a Motion Studio concern
 * (`npx remotion render`).
 *
 * ── PEER REQUIREMENTS ───────────────────────────────────────────────────────
 * React 19, and the `remotion` / `@remotion/player` versions this was built
 * against. Remotion requires every one of its packages to be on the same
 * version, so the consuming app must not install a different one.
 */

// ── Components ──────────────────────────────────────────────────────────────
export { MotionTemplate } from './MotionTemplate.jsx';
export { PlayerStatsTemplate, SubjectShowcaseTemplate } from './named.jsx';

// ── Discovery ───────────────────────────────────────────────────────────────
// What can this runtime render, in what shapes, with what sample data.
export { listTemplates, getTemplateSample, getTemplateSamples } from './templates.js';

// ── Configuration ───────────────────────────────────────────────────────────
export { configureMotionRuntime, currentAssetBase } from './config.js';

// ── Host integration ────────────────────────────────────────────────────────
// Used by Motion Studio's own Remotion root. An external app never calls this:
// it registers <Composition>s, which only means something inside a Remotion
// bundle.
export { registerTemplates } from './register.jsx';
