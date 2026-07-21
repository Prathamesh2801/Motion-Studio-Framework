/**
 * Timeline engine (Ring 1) — brand- and medium-agnostic.
 *
 * `buildTimeline(plan, { fps, timebase, transition })` turns a scene plan into
 * absolute frame positions. How lengths are expressed is a swappable strategy;
 * see `strategies.js` for the contract and how to add your own.
 */
export { buildTimeline, resolveOverlap } from './buildTimeline.js';
export {
  timebases,
  resolveTimebase,
  registerTimebase,
  createBarGrid,
  framesTimebase,
  secondsTimebase,
  barsTimebase,
} from './strategies.js';
