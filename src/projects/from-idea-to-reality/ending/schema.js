import { z } from "zod";

/**
 * The ending sequence's tunable values — schema, defaults, and the one
 * derived-layout function every consumer shares. Mirrors `opening/schema.js`
 * exactly in shape and intent; see that file for why this is the framework's
 * tuning convention (Studio's native Props panel via `schema`/`defaultProps`)
 * rather than a custom store or panel.
 *
 * ── WHY A SEPARATE SCHEMA, NOT MERGED INTO THE OPENING'S ────────────────────
 * A `<Composition>` takes exactly one `schema`. Flattening the opening's and
 * ending's groups into one object would collide on key names (both want a
 * `title` group, both want a `debug` group). `index.jsx` nests them instead —
 * `openingProps`/`endingProps` — so each sequence keeps the flat, readable
 * group names its own file expects, and Studio renders them as two top-level
 * sections rather than one that's ambiguous about which `title` is which.
 *
 * ── THREE BEATS, TWO DIFFERENT RELATIONSHIPS ────────────────────────────────
 * Message → title is a CROSSFADE by design ("the message resolves into the
 * title") — `title.revealStart` is meant to land inside message's own fade
 * window, so there is no floor between them; the director controls the
 * overlap directly. Title → brand is the opposite: a distinct, sequential
 * beat ("the identity FINALLY returns"), so — same pattern as the opening's
 * wordmark/title fix — `brand`'s effective reveal start is floored at
 * `title`'s hold ending plus `ending.pauseBetweenBeats`, guaranteeing real
 * separation regardless of what `brand.revealStart` is set to.
 */

const beatFields = {
  scale: z.number(),
  yPosition: z.number().describe("% from top"),
  revealStart: z.number().describe("local frame, within the ending sequence"),
  revealDuration: z.number(),
  holdDuration: z.number(),
  fadeDuration: z.number(),
};

export const endingMessageSchema = z.object(beatFields);
export const endingTitleSchema = z.object(beatFields);
export const endingBrandSchema = z.object(beatFields);

export const endingBeatsSchema = z.object({
  pauseBeforeMessage: z
    .number()
    .describe(
      "black/silent hold after the film ends, before the message appears",
    ),
  pauseBetweenBeats: z
    .number()
    .describe("minimum gap between the title settling and the brand appearing"),
  fadeToBlackDuration: z
    .number()
    .describe("trailing black hold after title+brand finish fading"),
});

export const endingDebugSchema = z.object({
  showSafeArea: z.boolean(),
  showTimelineMarkers: z.boolean(),
});

/** The ending sequence's slice of `FromIdeaToReality`'s prop schema — see `index.jsx`. */
export const endingSchema = z.object({
  message: endingMessageSchema,
  title: endingTitleSchema,
  brand: endingBrandSchema,
  ending: endingBeatsSchema,
  debug: endingDebugSchema,
});

export const ENDING_DEFAULT_PROPS = {
  message: {
    scale: 1.5,
    yPosition: 50,
    revealStart: 0,
    revealDuration: 20,
    holdDuration: 30,
    fadeDuration: 18,
  },
  title: {
    scale: 1.5,
    yPosition: 50,
    revealStart: 70,
    revealDuration: 26,
    holdDuration: 34,
    fadeDuration: 20,
  },
  brand: {
    scale: 3,
    yPosition: 66,
    revealStart: 120,
    revealDuration: 20,
    holdDuration: 28,
    fadeDuration: 20,
  },
  ending: {
    pauseBeforeMessage: 12,
    pauseBetweenBeats: 10,
    fadeToBlackDuration: 12,
  },
  debug: {
    showSafeArea: false,
    showTimelineMarkers: false,
  },
};

/**
 * The few numbers every consumer needs that aren't a direct control.
 *
 * `messageExitStart` — when the message begins its own fade (independent of
 * everything else; it's gone long before title/brand's shared exit).
 * `brandStart` — brand's EFFECTIVE reveal start, floored per the module doc.
 * `fadeAllStart` — the single shared moment title and brand fade out
 * together, once brand has held; each still uses its own `fadeDuration`.
 * `total` — full sequence length, including the trailing black hold.
 */
export const deriveEndingLayout = ({ message, title, brand, ending }) => {
  const messageExitStart =
    message.revealStart + message.revealDuration + message.holdDuration;
  const titleHoldEnd =
    title.revealStart + title.revealDuration + title.holdDuration;
  const brandStart = Math.max(
    brand.revealStart,
    titleHoldEnd + ending.pauseBetweenBeats,
  );
  const fadeAllStart = brandStart + brand.revealDuration + brand.holdDuration;
  const sequenceDuration =
    fadeAllStart +
    Math.max(title.fadeDuration, brand.fadeDuration) +
    ending.fadeToBlackDuration;
  const total = ending.pauseBeforeMessage + sequenceDuration;
  return {
    messageExitStart,
    brandStart,
    fadeAllStart,
    sequenceDuration,
    total,
  };
};
