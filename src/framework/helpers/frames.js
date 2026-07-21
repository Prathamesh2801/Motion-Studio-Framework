import { FPS } from '../formats/index.js';

/**
 * Time <-> frame conversion. Motion tokens are authored in frames at `FPS`;
 * anything expressed in seconds passes through here so a future frame-rate
 * change stays a one-line edit.
 *
 * NOTE: the seconds-based scene-plan builder that lived alongside these in the
 * reference project is intentionally NOT here — the generic, multi-timebase
 * timeline engine (frames | seconds | bars) is built as its own module in
 * Phase 3 (`framework/timeline/`). These remain the low-level primitives it
 * builds on.
 */

export const toFrames = (seconds, fps = FPS) => Math.round(seconds * fps);

export const toSeconds = (frames, fps = FPS) => frames / fps;

/** Rescales a frame count authored at `FPS` to the composition's actual fps. */
export const scaleFrames = (frames, fps) => Math.round((frames * fps) / FPS);

// NOTE: a `durationInFrames(seconds, fps)` helper used to live here. It was
// removed in Phase 5: `durationInFrames` is also the name of a Remotion prop and
// a local variable in nearly every layout, hook and component, so exporting it
// through the barrel made accidental shadowing a matter of time. Build durations
// with `buildTimeline` (which is the source of truth for them) or `toFrames`.
