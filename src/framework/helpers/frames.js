import { FPS } from '../formats/index.js';

/**
 * Frame-rate independence.
 *
 * Motion tokens are authored in frames at `FPS` (30). Anything that must survive
 * a composition running at a different frame rate passes through here, so the
 * conversion lives in one place instead of being written as `fps / 30` wherever
 * it happens to be needed.
 *
 * Scene *lengths* are not this module's job — that is the timeline engine's
 * (`framework/timeline/`), which owns rounding so error never compounds across a
 * film.
 */

/** Rescales a frame count authored at `FPS` to the composition's actual fps. */
export const scaleFrames = (frames, fps) => Math.round((frames * fps) / FPS);
