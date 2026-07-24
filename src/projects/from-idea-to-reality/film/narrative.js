import { assetsFor } from '@/framework';

/**
 * From Idea to Reality — content and per-shot direction.
 *
 * Kept apart from the assembler so the film can be re-worded, re-lit or
 * re-shot without touching structure. Plain data only: no JSX, no components.
 *
 * The film is SILENT, so "content" here is mostly direction rather than copy —
 * which atmosphere each shot is lit with, and which camera move it carries. Two
 * flat maps keyed by shot id. They live here rather than inline in the scenes
 * because the film's lighting and camera arcs are only legible when you can
 * read them top to bottom as a list.
 */

/** Project-scoped asset resolver. The score lands here in Step 8. */
export const asset = assetsFor('from-idea-to-reality');

/**
 * ── THE WEATHER ─────────────────────────────────────────────────────────────
 * flat     absence      the Void and the Doubt — no glows, deep vignette
 * hearth   the human    warm amber pool; the film's only safe place
 * workshop the system   cold indigo, and the ONLY recipe with a visible grid
 * studio   full energy  indigo above and amber below, in tension
 *
 * Read as a column, this is the film's dramatic arc:
 * empty → warm → empty → warm → cold → charged → warm.
 */
export const ATMOSPHERE = {
  void: 'flat',
  spark: 'hearth',
  doubt: 'flat',
  drift: 'flat',
  count: 'flat',
  'first-mark': 'hearth',
  repeat: 'workshop',
  row: 'workshop',
  grid: 'workshop',
  field: 'workshop',
  planes: 'studio',
  layers: 'studio',
  lattice: 'studio',
  depth: 'studio',
  traverse: 'studio',
  peak: 'studio',
  form: 'hearth',
  handover: 'hearth',
};

/**
 * ── THE CAMERA ──────────────────────────────────────────────────────────────
 * The camera is a character whose attitude changes. Its most important entry is
 * `first-mark: 'static'` — after three handheld shots, the drift stopping dead
 * is the loudest gesture in a film where something is always moving. Stillness
 * is the emphasis, not a movement.
 */
export const CAMERA = {
  void: 'static', // locked off; nothing is happening and the camera knows it
  spark: 'pushIn', // leaning in, curious
  doubt: 'handheld', // instability = uncertainty (seeded, so renders repeat)
  drift: 'handheld',
  count: 'handheld',
  'first-mark': 'static', // ⭐ the drift stops. The decision.
  repeat: 'push', // steady, inevitable, mechanical
  row: 'push',
  grid: 'push',
  field: 'push',
  planes: 'pan', // dolly energy; alternates with push so no two cuts match
  layers: 'push',
  lattice: 'pan',
  depth: 'push',
  traverse: 'pan',
  peak: 'push',
  form: 'pull', // pulling back to reveal the whole — the first pull in the film
  handover: 'static',
};

/**
 * ── THE WORDS ───────────────────────────────────────────────────────────────
 * In a silent film every word is a subtitle, and a subtitle is the cheapest
 * way to say anything — so a beat that needs a sentence to work is a beat
 * whose image has failed. The film's closing title card ("From Idea to
 * Reality") is no longer here — it lives in `ending/Ending.jsx` now, the
 * one place the title is spoken.
 *
 * Two registers, never mixed in one shot:
 *   serif  the human voice — feeling, decision, arrival
 *   mono   the system voice — fact, label, measurement
 *
 * The Spark deliberately carries NO words. The first text in the film is the
 * cold count, so the audience meets the idea in silence and meets the fact
 * afterwards. Sentiment first would have made it a greeting card.
 */
export const WORDS = {
  /** mono. An odd number: round numbers read as invented, odd ones as true. */
  count: 'IDEA · UNTOUCHED · 419 DAYS',
  /** serif. Spoken at the hinge, over the first mark. */
  firstMark: 'Then someone begins.',
  /** mono. The system's own vocabulary, in the middle of the build. */
  structure: 'REPEAT / ALIGN / REPEAT',
  /** serif. The arrival. */
  form: 'And it becomes real.',
};
