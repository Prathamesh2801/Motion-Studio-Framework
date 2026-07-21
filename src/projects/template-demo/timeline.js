import { buildTimeline } from '@/framework';

/**
 * A film described purely as data: which template beat, and how long.
 *
 * Re-ordering the film is re-ordering this array — no frame arithmetic, and no
 * scene component needs touching.
 */
export const SCENE_PLAN = [
  { id: 'title', seconds: 3 },
  { id: 'hero', seconds: 4 },
  { id: 'section', seconds: 3 },
  { id: 'features', seconds: 4.5 },
  { id: 'stats', seconds: 4 },
  { id: 'milestones', seconds: 4.5 },
  { id: 'quote', seconds: 4, transition: 'wipe' },
  { id: 'gallery', seconds: 4.5 },
  { id: 'product', seconds: 4.5 },
  { id: 'video', seconds: 4, transition: 'slide' },
  { id: 'cta', seconds: 4 },
  { id: 'outro', seconds: 4 },
];

export const templateTimeline = (fps) =>
  buildTimeline(SCENE_PLAN, { fps, timebase: 'seconds', transition: 'base' });

export const templateDuration = (fps) => templateTimeline(fps).durationInFrames;
