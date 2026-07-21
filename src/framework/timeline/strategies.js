/**
 * Timebase strategies — how a scene plan's lengths become frames.
 *
 * This is a REGISTRY, not a switch: adding a way to express time (a voiceover
 * transcript, a data table, a semantic beat sheet) is a new entry, never a
 * change to the engine. Projects can register their own or pass a strategy
 * object inline without registering at all.
 *
 * ── THE CONTRACT ────────────────────────────────────────────────────────────
 * A strategy is a plain object. Only `lengthOf` is required; every other hook is
 * an opt-in refinement, so a simple strategy stays a two-line object.
 *
 *   name                          Identifier (set for you by registerTimebase).
 *   lengthOf(scene, ctx)   -> frames
 *       Length of one scene. Required.
 *   startsOf(plan, ctx)    -> number[]                                [optional]
 *       Absolute start frame per scene. Override this when lengths must NOT be
 *       accumulated — a grid-locked timebase rounds each start from its own
 *       absolute position so rounding error never compounds across the film.
 *       Omit it and the engine accumulates lengths, which is exact for integers.
 *   totalOf(plan, ctx)     -> frames                                  [optional]
 *       Exact total picture length. Same rationale as `startsOf`.
 *   validate(plan, ctx)    -> void (throws)                           [optional]
 *       Fail loudly at build time on a plan this timebase cannot express.
 *   metaOf(scene, i, ctx)  -> object                                  [optional]
 *       Extra per-scene metadata surfaced on the timeline entry.
 *   derive(plan, ctx, starts) -> object                               [optional]
 *       Extra timeline-level outputs (e.g. `musicCuts`).
 *
 * `ctx` is `{ fps, options }`, where `options` is whatever the caller passed to
 * `buildTimeline` beyond the known keys — the strategy's own configuration.
 *
 * Scenes carry arbitrary extra fields through to the built timeline untouched,
 * so richer/semantic plans need no engine change.
 */

import { createRegistry } from '../helpers/registry.js';

const positiveFrames = (value, label) => {
  if (!Number.isFinite(value)) throw new Error(`${label} is not a finite number.`);
  return Math.max(1, Math.round(value));
};

/** Frames — the primitive every other timebase compiles down to. */
export const framesTimebase = {
  lengthOf: (scene) => positiveFrames(scene.frames, `Scene "${scene.id}": \`frames\``),
  validate: (plan) => {
    plan.forEach((scene) => {
      if (typeof scene.frames !== 'number') {
        throw new Error(`Scene "${scene.id}" needs a numeric \`frames\` for the "frames" timebase.`);
      }
    });
  },
};

/** Seconds — the default for most videos (explainers, promos, social, VO). */
export const secondsTimebase = {
  lengthOf: (scene, { fps }) => positiveFrames(scene.seconds * fps, `Scene "${scene.id}": \`seconds\``),
  validate: (plan) => {
    plan.forEach((scene) => {
      if (typeof scene.seconds !== 'number') {
        throw new Error(`Scene "${scene.id}" needs a numeric \`seconds\` for the "seconds" timebase.`);
      }
    });
  },
};

/**
 * Build a musical/rhythmic grid descriptor.
 *
 * NOTE: a bar grid is a TIMEBASE, not a claim that the video has music. Use it
 * whenever cuts should land on a regular rhythmic lattice. Audio is optional and
 * enters only if scenes declare `sourceBar` (see `derive` below).
 */
export const createBarGrid = ({ bpm, beatsPerBar = 4, downbeatSeconds = 0 }) => {
  if (!Number.isFinite(bpm) || bpm <= 0) throw new Error('createBarGrid: `bpm` must be a positive number.');
  const beatSeconds = 60 / bpm;
  return {
    bpm,
    beatsPerBar,
    beatSeconds,
    barSeconds: beatSeconds * beatsPerBar,
    /** First downbeat. Anything before it is pickup, which the film opens over. */
    downbeatSeconds,
  };
};

const gridOf = (options) => {
  const grid = options?.grid;
  if (!grid) throw new Error('The "bars" timebase needs a `grid` (see `createBarGrid`).');
  return grid;
};

/** Cumulative bars elapsed before each scene. */
const barOffsets = (plan) => {
  const offsets = [];
  let elapsed = 0;
  for (const scene of plan) {
    offsets.push(elapsed);
    elapsed += scene.bars;
  }
  return { offsets, total: elapsed };
};

/**
 * Bars — a grid-locked timebase.
 *
 * Starts are rounded from each scene's ABSOLUTE bar position rather than
 * accumulated, so every cut stays within half a frame of its true bar line no
 * matter how many scenes precede it. (Accumulating rounded bar lengths drifts
 * off the grid within a handful of cuts.)
 *
 * Optional audio alignment: give a scene a `sourceBar` to say where the SOURCE
 * material is at that point — which is not the same as where the film is, if the
 * edit skips material. `derive` turns those into `musicCuts`. Scenes without
 * `sourceBar` produce no cuts and need no audio at all.
 */
export const barsTimebase = {
  lengthOf: (scene, { fps, options }) => {
    const grid = gridOf(options);
    return positiveFrames(scene.bars * grid.barSeconds * fps, `Scene "${scene.id}": \`bars\``);
  },

  startsOf: (plan, { fps, options }) => {
    const grid = gridOf(options);
    const barFrames = grid.barSeconds * fps;
    const lead = grid.downbeatSeconds * fps;
    const { offsets } = barOffsets(plan);
    // Scene 0 opens at frame 0 (over the pickup); later scenes sit on bar lines.
    return offsets.map((bars, index) => (index === 0 ? 0 : Math.round(lead + bars * barFrames)));
  },

  totalOf: (plan, { fps, options }) => {
    const grid = gridOf(options);
    const { total } = barOffsets(plan);
    return Math.round(grid.downbeatSeconds * fps + total * grid.barSeconds * fps);
  },

  validate: (plan, { options }) => {
    const { lastSourceBar, phraseBars = 4 } = options ?? {};
    gridOf(options);

    plan.forEach((scene, index) => {
      if (typeof scene.bars !== 'number' || scene.bars <= 0) {
        throw new Error(`Scene "${scene.id}" needs a positive numeric \`bars\` for the "bars" timebase.`);
      }
      if (scene.sourceBar === undefined) return;

      // Guards the failure that is otherwise silent and expensive: a scene
      // reaching past the end of the source renders as picture over silence,
      // which nothing throws on and nobody notices until final review.
      if (lastSourceBar !== undefined && scene.sourceBar + scene.bars > lastSourceBar) {
        throw new Error(
          `Scene "${scene.id}" runs to source bar ${scene.sourceBar + scene.bars}, past the end of ` +
            `the material (bar ${lastSourceBar}). Shorten it or splice it earlier.`,
        );
      }

      const previous = plan[index - 1];
      if (!previous || previous.sourceBar === undefined) return;
      const continues = scene.sourceBar === previous.sourceBar + previous.bars;
      if (!continues && scene.sourceBar % phraseBars !== 0) {
        throw new Error(
          `Scene "${scene.id}" splices to source bar ${scene.sourceBar}, which is not a phrase ` +
            `boundary (a multiple of ${phraseBars}). Splices belong where the arrangement expects change.`,
        );
      }
    });
  },

  metaOf: (scene) => (scene.sourceBar === undefined ? {} : { sourceBar: scene.sourceBar }),

  /**
   * Audio splice points, derived from the SAME starts that position the picture
   * — which is what guarantees sound and image cut on the same instants.
   * Empty when no scene declares `sourceBar` (i.e. the video isn't music-driven).
   */
  derive: (plan, { options }, starts) => {
    const grid = gridOf(options);
    if (!plan.some((scene) => scene.sourceBar !== undefined)) return { musicCuts: [] };

    const sourceSecondsFor = (bar) => (bar === 0 ? 0 : grid.downbeatSeconds + bar * grid.barSeconds);
    const first = plan[0];
    const cuts = [{ from: 0, sourceSeconds: sourceSecondsFor(first.sourceBar ?? 0) }];

    plan.forEach((scene, index) => {
      if (index === 0 || scene.sourceBar === undefined) return;
      const previous = plan[index - 1];
      if (previous.sourceBar === undefined) return;
      // A scene that simply plays on from its predecessor needs no cut.
      if (scene.sourceBar === previous.sourceBar + previous.bars) return;
      cuts.push({ from: starts[index], sourceSeconds: sourceSecondsFor(scene.sourceBar) });
    });

    return { musicCuts: cuts };
  },
};

const timebaseRegistry = createRegistry({
  label: 'timebase',
  hint: 'Register one with registerTimebase(), or pass a strategy object.',
  validate: (name, strategy) => {
    if (typeof strategy?.lengthOf !== 'function') {
      throw new Error(`timebase "${name}": a strategy must implement \`lengthOf\`.`);
    }
  },
  // A one-off strategy object passes straight through, so a project can use a
  // custom timebase without registering it globally.
  coerce: (spec) =>
    spec && typeof spec === 'object' && typeof spec.lengthOf === 'function'
      ? { name: 'custom', ...spec }
      : undefined,
  entries: {
    frames: { ...framesTimebase, name: 'frames' },
    seconds: { ...secondsTimebase, name: 'seconds' },
    bars: { ...barsTimebase, name: 'bars' },
  },
});

/**
 * Register a custom timebase so it can be selected by name project-wide.
 * See `docs/TIMELINE.md` for the strategy contract.
 */
export const registerTimebase = (name, strategy) =>
  timebaseRegistry.register(name, { ...strategy, name });

/**
 * Resolve a timebase name, or pass a strategy object straight through.
 *
 * Throws on an unknown name rather than falling back: a silently wrong timebase
 * produces a video of the wrong length, which is far worse than a build error.
 */
export const resolveTimebase = timebaseRegistry.resolve;

export const timebases = timebaseRegistry.entries;
