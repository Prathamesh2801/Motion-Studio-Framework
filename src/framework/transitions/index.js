import { linearTiming, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { flip } from '@remotion/transitions/flip';
import { none } from '@remotion/transitions/none';
import { resolveOverlap } from '../timeline/buildTimeline.js';
import { resolveEasing } from '../animations/easing.js';
import { createRegistry } from '../helpers/registry.js';

/**
 * Named transition vocabulary over `@remotion/transitions` (Ring 1).
 *
 * A registry, like presets and cameras: adding a transition is an entry, not a
 * code path. Lengths come from the motion `transitions` tokens through the SAME
 * `resolveOverlap` the timeline uses, so the gap the timeline leaves and the
 * transition that fills it can never disagree.
 *
 * Keep the set small. A tight vocabulary is what makes many videos feel like one
 * system.
 */

/** Each entry: (props) => TransitionPresentation. Timing is applied separately. */
const transitionRegistry = createRegistry({
  label: 'transition',
  fallback: 'fade',
  validate: (name, build) => {
    if (typeof build !== 'function') {
      throw new Error(`transition "${name}": expected a function returning a presentation.`);
    }
  },
  entries: {
    /** Hard cut — no presentation. Prefer omitting the transition entirely. */
    none: () => none(),
    /** The house default: a soft dissolve. */
    fade: (props) => fade(props),
    /** Push the incoming scene in from an edge. */
    slide: ({ direction = 'from-right', ...props } = {}) => slide({ direction, ...props }),
    /** Reveal the incoming scene over the outgoing one. */
    wipe: ({ direction = 'from-right', ...props } = {}) => wipe({ direction, ...props }),
    /** 3D card turn. Use once per video at most. */
    flip: ({ direction = 'from-right', ...props } = {}) => flip({ direction, ...props }),
  },
});

/** Register a custom transition presentation under a name. */
export const registerTransition = transitionRegistry.register;

/**
 * Resolve a transition spec into what `<TransitionSeries.Transition>` needs.
 *
 * @param {string|object} spec  A name ('fade') or
 *   `{ type, duration, easing, timing, ...presentationProps }`, where `duration`
 *   is a motion token name ('cut'|'quick'|'base'|'slow') or a frame count.
 * @returns {{presentation: object, timing: object, durationInFrames: number}}
 */
export const resolveTransition = (spec = 'fade') => {
  const { type = 'fade', duration = 'base', easing, timing, ...props } =
    typeof spec === 'string' ? { type: spec } : spec;

  const build = transitionRegistry.resolve(type);
  const durationInFrames = resolveOverlap(duration);

  return {
    presentation: build(props),
    timing:
      timing ??
      linearTiming({
        durationInFrames,
        easing: easing ? resolveEasing(easing) : undefined,
      }),
    durationInFrames,
  };
};

export { linearTiming, springTiming };
export { TransitionSeries } from '@remotion/transitions';
