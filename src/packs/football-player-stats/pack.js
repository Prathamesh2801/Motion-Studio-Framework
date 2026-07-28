import { Film } from './Film.jsx';
import { footballPlayerSchema } from './schema.js';
import { toViewModel } from './adapter.js';
import { buildPackTimeline } from './timeline.js';
import { facets } from './facets.js';

import messi from './data/messi.json';
import ronaldo from './data/ronaldo.json';
import haaland from './data/haaland.json';
import mbappe from './data/mbappe.json';
import pedri from './data/pedri.json';
import bellingham from './data/bellingham.json';

/**
 * `football-player-stats` — the first real consumer of the engine, and the
 * blueprint every future sports pack is copied from.
 *
 * Four files carry all the work and none of them contains an animation:
 *   schema.js    what the JSON may say, in football's own vocabulary
 *   adapter.js   football → ViewModel. The ONLY domain-aware file.
 *   timeline.js  the beats (and therefore the duration)
 *   Film.jsx     the scene map — ~20 lines of slot wiring
 *
 * To add a cricket pack: copy this folder, rewrite those four files, ship
 * documents. `SubjectIntro`, `StatBoard` and `MetricSpotlight` are reused
 * unchanged, and the engine, resolver, hosts and editor need no changes at all.
 *
 * ── ASSETS ──────────────────────────────────────────────────────────────────
 * `public/packs/football-player-stats/` ships generated PLACEHOLDERS — abstract
 * silhouettes, geometric shields, flags built from real band layouts. Real
 * photographs and crests are somebody else's property; committing them would
 * make this repo undistributable. Drop real files at the same paths and nothing
 * in the code changes. Regenerate with
 * `node scripts/make-football-placeholders.mjs`.
 */
export const pack = {
  id: 'football-player-stats',
  title: 'Football — Player Statistics',
  category: 'sports',
  Film,
  schema: footballPlayerSchema,
  adapter: toViewModel,
  timeline: buildPackTimeline,
  formats: ['landscape', 'reel', 'square'],
  /** What the subject dropdown is called. The editor stays domain-free. */
  subjectLabel: 'Football Player',
  /** Declarative dropdowns — see facets.js for why they live in the pack. */
  facets,
  samples: [messi, ronaldo, haaland, mbappe, pedri, bellingham],
  note: 'Premium sports-broadcast player card. Six documents, one film — switching player changes portrait, name, number, crest, flag, league, five figures, season, competition and accent colour with no code change.',
};

export default pack;
