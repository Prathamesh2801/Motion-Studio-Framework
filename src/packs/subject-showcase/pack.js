import { Film } from './Film.jsx';
import { subjectShowcaseSchema } from './schema.js';
import { toViewModel } from './adapter.js';
import { buildPackTimeline } from './timeline.js';
import aurora from './data/aurora.json';
import meridian from './data/meridian.json';

/**
 * `subject-showcase` — the reference pack.
 *
 * Domain-free on purpose. Its two sample documents are a camera and a set of
 * quarterly results, which is the cheapest possible proof that nothing in the
 * pipeline below the adapter knows what it is describing.
 *
 * Copy this folder to start a new pack. Four files carry all the work —
 * `schema.js` (what the JSON may say), `adapter.js` (JSON → ViewModel),
 * `timeline.js` (the beats), `Film.jsx` (the scene map) — and none of them
 * contain an animation.
 *
 * ── MANIFEST CONTRACT ───────────────────────────────────────────────────────
 *   id        Folder name, asset scope (`public/packs/<id>/`), composition id.
 *   Film      The one component both hosts mount. Takes `{ vm, pace }`.
 *   schema    Zod, built with `packDocumentSchema` so the envelope is shared.
 *   adapter   `(document) => raw ViewModel`. The only domain-aware file.
 *   timeline  `(vm, fps, pace) => buildTimeline(...)`. Also the duration source.
 *   formats   Which formats this pack is designed to reflow into.
 *   samples   Documents shipped with the pack; the editor's starting list.
 *
 * There is no `duration` field, deliberately: `resolvePack` derives it from
 * `timeline()`. A hand-maintained duration is a number that drifts from the
 * film it describes the first time a beat changes.
 */
export const pack = {
  id: 'subject-showcase',
  title: 'Subject Showcase (reference)',
  category: 'reference',
  Film,
  schema: subjectShowcaseSchema,
  adapter: toViewModel,
  timeline: buildPackTimeline,
  formats: ['landscape', 'reel', 'square'],
  samples: [aurora, meridian],
  note: 'Domain-free reference pack. Proves the document → adapter → ViewModel → host pipeline, and is the template for new packs.',
};

export default pack;
