import { buildTimeline, createBarGrid } from '@/framework';

/**
 * Musical structure — a GRID-LOCKED film on the `bars` timebase.
 *
 * The grid describes the track that drives the edit: 120 BPM, 4/4, first
 * downbeat at 0s (this fixture has no pickup). A bar is 2s = 60 frames @30fps.
 *
 * `sourceBar` says where the MUSIC is at each scene, which is not the same as
 * where the FILM is — the edit skips source bars 4-8, so the `carousel` scene is
 * a splice. Keeping both makes the splice explicit rather than hidden in
 * arithmetic, and the engine derives the audio cut list from the same starts
 * that position the picture, so sound and image cut on identical frames.
 *
 * `lastSourceBar` guards the failure that is otherwise silent and expensive: a
 * scene reaching past the end of the track renders as picture over silence.
 */
export const GRID = createBarGrid({ bpm: 120, beatsPerBar: 4, downbeatSeconds: 0 });

/** The fixture track is 26s ≈ 13 bars; stay inside it. */
export const LAST_SOURCE_BAR = 13;

export const SCENE_PLAN = [
  { id: 'open', bars: 2, sourceBar: 0 },
  { id: 'beat-1', bars: 2, sourceBar: 2 }, // plays on — no splice
  // The only splice in the film, landing on a four-bar phrase boundary.
  { id: 'carousel', bars: 3, sourceBar: 8 },
  { id: 'close', bars: 2, sourceBar: 11 }, // contiguous with the carousel
];

export const TRANSITION = 'base';

export const musicalTimeline = (fps) =>
  buildTimeline(SCENE_PLAN, {
    fps,
    timebase: 'bars',
    transition: TRANSITION,
    grid: GRID,
    lastSourceBar: LAST_SOURCE_BAR,
  });

export const musicalDuration = (fps) => musicalTimeline(fps).durationInFrames;
