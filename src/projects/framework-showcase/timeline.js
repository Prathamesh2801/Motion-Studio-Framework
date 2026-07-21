import { buildTimeline } from '@/framework';

/**
 * The showcase film, as data.
 *
 * One chapter per subsystem, in dependency order — motion before camera before
 * layout before templates — so that if an early chapter is broken, the failures
 * downstream of it are expected rather than confusing.
 *
 * Lengths are in seconds (`seconds` timebase). Chapter 8 mounts its own nested
 * timeline on the `bars` timebase, which is the point of that chapter.
 */
export const SCENE_PLAN = [
  { id: 'title', seconds: 6 },
  { id: 'motion', seconds: 8 },
  { id: 'camera', seconds: 8 },
  { id: 'typography', seconds: 7 },
  { id: 'components', seconds: 8 },
  { id: 'layouts', seconds: 10 },
  { id: 'templates', seconds: 12, transition: 'wipe' },
  { id: 'timeline', seconds: 8 },
  { id: 'audio', seconds: 8 },
  { id: 'theme', seconds: 10, transition: 'slide' },
  { id: 'outro', seconds: 7 },
];

export const showcaseTimeline = (fps) =>
  buildTimeline(SCENE_PLAN, { fps, timebase: 'seconds', transition: 'base' });

export const showcaseDuration = (fps) => showcaseTimeline(fps).durationInFrames;
