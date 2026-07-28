// ── DELIBERATE EXCEPTION TO THE BARREL RULE ─────────────────────────────────
// Everywhere else, a pack imports from `@/framework`. Not here, and not in
// `schema.js` or `adapter.js`: these three files are PURE — no React, no frame —
// which is what lets `npm test` assert the whole data pipeline in plain Node
// with no bundler, exactly as it already does for the motion maths.
//
// Two things break that if they import the barrel. `@/` is a bundler alias Node
// cannot resolve, and `framework/index.js` re-exports .jsx files Node cannot
// parse. So the pure layer reaches for the specific module, the same way
// `scripts/test.mjs` does. Files with JSX in them keep using `@/framework`,
// because nothing outside a bundler was ever going to load them.
import { buildTimeline } from '../../framework/timeline/index.js';
import { heroMetric } from '../../engine/viewmodel.js';

/**
 * The beat plan.
 *
 * Lengths are authored in seconds and scaled by the document's `pace`, so
 * "make it snappier" is one field in the JSON rather than an edit to every
 * scene. `buildTimeline` turns that into absolute frame positions with the
 * transition overlap already accounted for — the same engine every project in
 * this repo uses, so a pack cannot invent its own idea of time.
 *
 * ── THE PLAN IS DERIVED FROM THE DATA ───────────────────────────────────────
 * A document with a `hero` metric earns a spotlight beat; one without does not,
 * and the film is shorter. That is the point of the whole subsystem: the
 * STRUCTURE responds to the data, and no component learned anything new to make
 * it happen. It is also why `durationInFrames` cannot be a constant, and why
 * `resolvePack` derives it from this function rather than from a manifest field
 * somebody would eventually forget to update.
 */
export const buildPackTimeline = (vm, fps, pace = 1) => {
  const seconds = (base) => Math.max(0.5, base * pace);

  const plan = [
    { id: 'intro', seconds: seconds(4) },
    ...(vm.metrics.length ? [{ id: 'figures', seconds: seconds(5) }] : []),
    ...(heroMetric(vm) ? [{ id: 'spotlight', seconds: seconds(3.5) }] : []),
    { id: 'outro', seconds: seconds(3.5) },
  ];

  return buildTimeline(plan, { fps, timebase: 'seconds', transition: 'base' });
};

export default buildPackTimeline;
