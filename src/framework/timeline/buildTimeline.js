import { resolveTimebase } from './strategies.js';
import { transitions as transitionTokens } from '../motion/index.js';

/**
 * Turn a scene plan into absolute frame positions.
 *
 * The plan is DATA: a list of scenes whose length is expressed in whatever
 * timebase suits the video — frames, seconds, a bar grid, or a strategy the
 * project supplies. The engine knows nothing about music, products or any
 * particular kind of video; it only knows the strategy contract.
 *
 * Two numbers per scene matter and are deliberately kept distinct:
 *   advance           how far the timeline moves forward at this scene
 *   durationInFrames  what to author on the <Sequence> — advance PLUS the
 *                     transition overlap it gives back to its successor
 *
 * A <TransitionSeries.Sequence> overlaps its predecessor by the transition
 * length, so every scene must be authored as its own advance plus that overlap.
 * Get it wrong and every subsequent cut slides. Both the timeline and the
 * transition registry read the overlap from the same motion token, so they
 * cannot disagree.
 *
 * @param {Array<object>} plan   Scenes; each needs an `id` plus whatever the
 *                               timebase reads. Extra fields pass through.
 * @param {object} options
 * @param {number} options.fps
 * @param {string|object} [options.timebase='seconds']  Name or strategy object.
 * @param {string|number} [options.transition=0]  Overlap: a motion token name
 *                               ('cut'|'quick'|'base'|'slow') or a frame count.
 * @param {...*} [options.rest]  Forwarded to the strategy as its `options`.
 */
export const buildTimeline = (plan, { fps, timebase = 'seconds', transition = 0, ...options } = {}) => {
  if (!Array.isArray(plan) || plan.length === 0) {
    throw new Error('buildTimeline: `plan` must be a non-empty array of scenes.');
  }
  if (!Number.isFinite(fps) || fps <= 0) {
    throw new Error('buildTimeline: `fps` must be a positive number.');
  }

  const seen = new Set();
  plan.forEach((scene, index) => {
    if (!scene?.id) throw new Error(`buildTimeline: scene at index ${index} has no \`id\`.`);
    if (seen.has(scene.id)) throw new Error(`buildTimeline: duplicate scene id "${scene.id}".`);
    seen.add(scene.id);
  });

  const strategy = resolveTimebase(timebase);
  const ctx = { fps, options };
  strategy.validate?.(plan, ctx);

  const overlap = resolveOverlap(transition);

  // Grid-locked timebases derive absolute starts themselves so rounding never
  // compounds; everything else accumulates its own lengths.
  const starts = strategy.startsOf
    ? strategy.startsOf(plan, ctx)
    : accumulateStarts(plan, strategy, ctx);

  const pictureFrames = strategy.totalOf
    ? strategy.totalOf(plan, ctx)
    : starts[plan.length - 1] + strategy.lengthOf(plan[plan.length - 1], ctx);

  const scenes = plan.map((scene, index) => {
    const from = starts[index];
    const nextStart = index + 1 < plan.length ? starts[index + 1] : pictureFrames;
    const advance = nextStart - from;

    if (advance <= 0) {
      throw new Error(
        `buildTimeline: scene "${scene.id}" has a non-positive length (${advance} frames). ` +
          'Check its plan entry and the timebase options.',
      );
    }

    return {
      ...scene,
      index,
      from,
      advance,
      durationInFrames: advance + overlap,
      meta: strategy.metaOf?.(scene, index, ctx) ?? {},
    };
  });

  return {
    scenes,
    byId: Object.fromEntries(scenes.map((scene) => [scene.id, scene])),
    /** Total composition length, including the final transition tail. */
    durationInFrames: pictureFrames + overlap,
    /** Picture length before that tail — useful when reasoning about sync. */
    pictureFrames,
    overlap,
    fps,
    timebase: strategy.name,
    /** Strategy extras, e.g. `musicCuts` from the bar grid. */
    derived: strategy.derive?.(plan, ctx, starts) ?? {},
  };
};

const accumulateStarts = (plan, strategy, ctx) => {
  const starts = [];
  let cursor = 0;
  for (const scene of plan) {
    starts.push(cursor);
    cursor += strategy.lengthOf(scene, ctx);
  }
  return starts;
};

/**
 * Overlap in frames from a motion transition token or an explicit count. Shared
 * with the transition registry so a transition's length and the gap the timeline
 * leaves for it are always the same number.
 */
export const resolveOverlap = (transition) => {
  if (typeof transition === 'number') return Math.max(0, Math.round(transition));
  const token = transitionTokens[transition];
  if (token === undefined) {
    throw new Error(
      `Unknown transition length "${transition}". Use a number of frames or one of: ` +
        `${Object.keys(transitionTokens).join(', ')}.`,
    );
  }
  return token;
};
