import { z } from "zod";

/**
 * The opening sequence's tunable values — schema, defaults, and the one
 * derived-layout function every consumer (the composition registry, the
 * component, the Sequence offsets) shares.
 *
 * ── WHY THIS IS THE WHOLE TUNING SYSTEM ─────────────────────────────────────
 * This project's tuning workflow is Remotion Studio's native one: a project
 * registered with `schema` + `defaultProps` (see `render/registerProject.jsx`,
 * which already forwards both to `<Composition>` — this is the first project
 * to actually use that, not a new capability) gets a live-editable Props
 * panel in Studio's sidebar for free. No custom store, no custom panel
 * component, no persistence code to maintain. Editing a value there is
 * editing a real React prop; it updates live because that's just how props
 * work, and a render (`remotion render`/`still`) always gets `defaultProps`
 * unless something explicitly passes `--props` to override them.
 *
 * The four groups below (`wordmark`, `title`, `opening`, `debug`) are a
 * nested Zod object, which Studio renders as four collapsible sections —
 * matching the grouping the values are used in throughout `Opening.jsx`.
 *
 * `OPENING_TUNING_DEFAULTS` values are unchanged from the previously
 * approved opening (see git history on the earlier `dev/openingTuning.js`
 * for the reasoning behind each number) — this file only changes WHERE they
 * live, not what they are.
 */

export const openingWordmarkSchema = z.object({
  initialScale: z.number(),
  finalScale: z.number(),
  initialY: z.number().describe("% from top"),
  finalY: z.number().describe("% from top"),
  moveStartFrame: z.number(),
  moveDuration: z.number(),
  holdDuration: z.number().describe("centered hold, before the move starts"),
  fadeInDuration: z.number(),
  fadeOutDuration: z.number(),
});

export const openingTitleSchema = z.object({
  scale: z.number(),
  yPosition: z.number().describe("% from top"),
  revealFrame: z.number(),
  revealDuration: z.number(),
  holdDuration: z.number().describe("held together with the settled wordmark"),
  fadeOutDuration: z.number(),
});

export const openingBeatsSchema = z.object({
  preRollDuration: z.number(),
  blackHoldDuration: z.number(),
});

export const openingDebugSchema = z.object({
  showSafeArea: z.boolean(),
  showTimelineMarkers: z.boolean(),
  showCurrentFrame: z.boolean(),
});

/** The `FromIdeaToReality` composition's prop schema — registered in `projects/registry.js`. */
export const openingSchema = z.object({
  wordmark: openingWordmarkSchema,
  title: openingTitleSchema,
  opening: openingBeatsSchema,
  debug: openingDebugSchema,
});

export const OPENING_DEFAULT_PROPS = {
  wordmark: {
    initialScale: 5,
    finalScale: 3,
    initialY: 50,
    finalY: 26,
    moveStartFrame: 39,
    moveDuration: 25,
    holdDuration: 15,
    fadeInDuration: 27,
    fadeOutDuration: 18,
  },
  title: {
    scale: 2,
    yPosition: 50,
    revealFrame: 70,
    revealDuration: 30,
    holdDuration: 35,
    fadeOutDuration: 18,
  },
  opening: {
    preRollDuration: 9,
    blackHoldDuration: 6,
  },
  debug: {
    showSafeArea: true,
    showTimelineMarkers: true,
    showCurrentFrame: true,
  },
};

/**
 * The brief pause between the wordmark's move finishing and the title
 * beginning to reveal — Beat 2's "hold briefly" before Beat 3 is allowed to
 * start. Not schema-tunable: this is a structural gap, not a creative choice
 * a director needs to dial in, and leaving it out of the schema is what keeps
 * it from ever being tuned away to zero (or negative) by accident. 6 frames
 * (0.2s @ 30fps) matches this project's own "brief" elsewhere (`opening.
 * blackHoldDuration`'s default).
 */
const POST_SETTLE_HOLD = 6;

/**
 * The few numbers every consumer needs that aren't a direct control —
 * derived once here so `Opening.jsx`, `index.jsx`'s Sequence offset, and the
 * registry's static `durationInFrames` can never disagree.
 *
 * `revealStart` is a FLOOR, not a straight passthrough of `title.
 * revealFrame`: the title is never allowed to begin revealing before the
 * wordmark's move has fully finished plus `POST_SETTLE_HOLD`, regardless of
 * what `title.revealFrame` is set to. This is what makes "the title reveal
 * must not overlap the brand movement" a guarantee rather than a number a
 * director has to get right — `title.revealFrame` still works as a control
 * for pushing the reveal LATER (a longer pause), just never earlier than the
 * settle allows.
 *
 * NOTE ON COMPOSITION LENGTH: this is called two different ways. Inside
 * `FromIdeaToReality`, it's called with the component's LIVE props, so the
 * main film's `Sequence from={}` offset stays correct as you tune values in
 * Studio. But the composition's own registered `durationInFrames` (in
 * `projects/registry.js`) is computed once from `OPENING_DEFAULT_PROPS` — a
 * `<Composition>`'s total length isn't reactive to prop edits without
 * `calculateMetadata`, which this project doesn't use, to keep the tuning
 * workflow simple. Tuning within the default total works live; pushing the
 * total past it will get clipped by the composition's fixed length until the
 * registry's duration is updated to match a newly settled total.
 */
export const deriveOpeningLayout = ({ wordmark, title, opening }) => {
  const wordmarkSettleEnd = wordmark.moveStartFrame + wordmark.moveDuration;
  const revealStart = Math.max(title.revealFrame, wordmarkSettleEnd + POST_SETTLE_HOLD);
  const fadeAllStart = revealStart + title.revealDuration + title.holdDuration;
  const identityDuration =
    fadeAllStart + Math.max(wordmark.fadeOutDuration, title.fadeOutDuration);
  const total =
    opening.preRollDuration + identityDuration + opening.blackHoldDuration;
  return { revealStart, fadeAllStart, identityDuration, total };
};
