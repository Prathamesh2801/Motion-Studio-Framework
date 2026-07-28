// ── DELIBERATE EXCEPTION TO THE BARREL RULE ─────────────────────────────────
// This file, `schema.js` and `adapter.js` are PURE — no React, no frame — which
// is what lets `npm test` assert the whole data pipeline in plain Node with no
// bundler. Two things break that if they import `@/framework`: `@/` is a bundler
// alias Node cannot resolve, and `framework/index.js` re-exports .jsx Node
// cannot parse. So the pure layer reaches for the specific module, exactly as
// `scripts/test.mjs` does. `Film.jsx` keeps using `@/framework`.
import { buildTimeline } from '../../framework/timeline/index.js';
import { heroMetric } from '../../engine/viewmodel.js';

/**
 * The beat plan: introduce, count, dwell, sign off.
 *
 * Lengths are authored in seconds and scaled by the document's `pace`, so
 * "make it snappier" is one field in the JSON rather than an edit to four
 * scenes.
 *
 * ── THE STRUCTURE IS DERIVED FROM THE DATA ──────────────────────────────────
 * The spotlight beat only exists when a metric declared `emphasis: 'hero'`, so
 * a document without a rating produces a genuinely shorter film. This is why
 * `resolvePack` derives `durationInFrames` from this function instead of reading
 * a constant off the manifest — a hand-maintained duration drifts from the film
 * it describes the first time a beat changes, and truncates the render.
 *
 * The board gets the longest beat on purpose: five counters staggered at
 * `stagger.loose` need time to finish counting before the cut, and a stat that
 * is still climbing when the scene ends reads as a bug rather than a flourish.
 */
export const buildPackTimeline = (vm, fps, pace = 1) => {
  const seconds = (base) => Math.max(0.5, base * pace);

  const plan = [
    { id: 'intro', seconds: seconds(5) },
    ...(vm.metrics.length ? [{ id: 'board', seconds: seconds(6.5) }] : []),
    ...(heroMetric(vm) ? [{ id: 'spotlight', seconds: seconds(4) }] : []),
    { id: 'signoff', seconds: seconds(3.5) },
  ];

  return buildTimeline(plan, { fps, timebase: 'seconds', transition: 'base' });
};

export default buildPackTimeline;
