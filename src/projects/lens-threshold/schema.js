import { z } from 'zod';

/**
 * Lens Threshold — tunable values.
 *
 * Same tuning convention as `from-idea-to-reality/opening/schema.js`: a Zod
 * schema + `defaultProps`, registered via `registry.js`, live-editable in
 * Remotion Studio's native Props panel. See `docs/AUTHORING.md` §8.
 *
 * The whole piece is one continuous camera move (`camera.push`) across the
 * full duration. Both source clips play in FULL — nothing is trimmed short —
 * and are merged by overlapping the tail of Video A with the head of Video B
 * for `timing.rackDuration` frames, cross-dissolving between them via a focus
 * rack (see `framework/camera/index.js`'s `focusRack`) rather than cutting.
 *
 * ── WHY SOURCE DURATIONS ARE MEASURED CONSTANTS, NOT SCHEMA FIELDS ──────────
 * Clip length is a fact about the footage, not a creative choice a director
 * tunes — same reasoning as `film/filmTimeline.js`'s BPM constant in
 * from-idea-to-reality. Measured via `ffprobe -show_entries format=duration`
 * against the files in `public/projects/lens-threshold/video/`. Re-measure
 * and update here if either source file is ever re-exported.
 */
export const SOURCE_DURATIONS_SECONDS = {
  headsetRotation: 8.433333,
  worldReveal: 5.0,
};

export const lensThresholdTimingSchema = z.object({
  rackDuration: z.number().describe('frames the tail of Video A and the head of Video B overlap and cross-dissolve'),
});

export const lensThresholdCameraSchema = z.object({
  push: z.number().describe('total push-in amount across the full duration (e.g. 0.14 = 14%)'),
});

export const lensThresholdFocusSchema = z.object({
  maxBlur: z.number().describe('px of defocus Video A reaches as it dissolves out'),
  incomingStartBlur: z.number().describe('px of defocus Video B starts at, at the moment it begins playing'),
  incomingStartOpacity: z.number().describe('0-1 — how faintly Video B is present the instant it starts playing'),
  incomingSettleScale: z.number().describe('Video B\'s starting scale, settling to 1 as it comes into focus'),
});

export const lensThresholdDebugSchema = z.object({
  showTimelineMarkers: z.boolean(),
});

/** The `LensThreshold` composition's prop schema — registered in `projects/registry.js`. */
export const lensThresholdSchema = z.object({
  timing: lensThresholdTimingSchema,
  camera: lensThresholdCameraSchema,
  focus: lensThresholdFocusSchema,
  debug: lensThresholdDebugSchema,
});

export const LENS_THRESHOLD_DEFAULT_PROPS = {
  timing: {
    rackDuration: 60,
  },
  camera: {
    push: 0.14,
  },
  focus: {
    maxBlur: 26,
    incomingStartBlur: 18,
    incomingStartOpacity: 0.32,
    incomingSettleScale: 1.03,
  },
  debug: {
    showTimelineMarkers: true,
  },
};

/**
 * The few numbers every consumer needs derived once, so `Portal.jsx`, the
 * composition's `Sequence`s and `registry.js`'s duration can never disagree —
 * same pattern as `deriveOpeningLayout` in
 * `from-idea-to-reality/opening/schema.js`.
 *
 * `durationA`/`durationB` are each clip's FULL native length in frames.
 * `rackStart` sits `timing.rackDuration` frames before Video A ends, so the
 * cross-dissolve consumes A's own tail rather than cutting it off early;
 * Video B then starts playing (from ITS OWN frame 0) at `rackStart` and runs
 * for its full length, so it is never trimmed either.
 */
export const deriveLensThresholdLayout = ({ timing, fps }) => {
  const durationA = Math.round(SOURCE_DURATIONS_SECONDS.headsetRotation * fps);
  const durationB = Math.round(SOURCE_DURATIONS_SECONDS.worldReveal * fps);
  const rackDuration = Math.min(timing.rackDuration, durationA, durationB);
  const rackStart = durationA - rackDuration;
  const rackEnd = durationA;
  const total = rackStart + durationB;
  return { durationA, durationB, rackStart, rackEnd, total };
};
