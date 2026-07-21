import { buildTimeline } from '@/framework';

/**
 * Explainer structure — a NON-MUSICAL film on the `seconds` timebase.
 *
 * Nothing here knows about audio, bars or beats. Scene lengths are authored in
 * plain seconds, which is the right default for explainers, promos and social
 * cuts where pacing follows the copy rather than a track.
 *
 * `seconds` is the only number to edit: frame positions, the total length and
 * the transition overlap are all derived, so changing one scene never requires
 * recalculating the scenes after it.
 */
export const SCENE_PLAN = [
  { id: 'hook', seconds: 3.5 },
  { id: 'problem', seconds: 4 },
  { id: 'answer', seconds: 4 },
  { id: 'close', seconds: 3.5 },
];

/** Motion token; the timeline and the transition read the same value. */
export const TRANSITION = 'base';

export const explainerTimeline = (fps) =>
  buildTimeline(SCENE_PLAN, { fps, timebase: 'seconds', transition: TRANSITION });

export const explainerDuration = (fps) => explainerTimeline(fps).durationInFrames;
