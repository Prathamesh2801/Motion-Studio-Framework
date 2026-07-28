import { PACKS, packById } from '@/packs/registry.js';

/**
 * The public template catalogue (Ring 5).
 *
 * ── WHY A NAME MAP AND NOT JUST THE PACK IDS ────────────────────────────────
 * `packs/registry.js` is an internal list whose ids are folder names. This is
 * the PUBLISHED surface, and the two should be free to move independently: a
 * pack folder can be renamed or split without breaking a consumer's import, and
 * a consumer-facing name can stay stable across a rewrite of the pack behind it.
 *
 * That is also why the aliases exist. `template="football-player"` reads better
 * in someone else's JSX than `template="football-player-stats"`, and both
 * resolve to the same pack, so neither is wrong.
 *
 * Listed explicitly rather than derived, for the same reason the project and
 * pack registries are: it is greppable, diffable, and a name is a promise. A
 * generated list would silently rename a consumer's template when a folder
 * moved.
 */
const TEMPLATES = {
  'football-player-stats': {
    pack: 'football-player-stats',
    component: 'PlayerStatsTemplate',
    aliases: ['football-player', 'player-stats'],
    summary: 'Premium sports-broadcast player card: portrait, identity, five animated figures, rating spotlight.',
  },
  'subject-showcase': {
    pack: 'subject-showcase',
    component: 'SubjectShowcaseTemplate',
    aliases: ['showcase'],
    summary: 'Domain-free subject card: a subject, labelled facts and animated figures.',
  },
};

const byName = new Map();
for (const [name, entry] of Object.entries(TEMPLATES)) {
  byName.set(name, entry);
  for (const alias of entry.aliases ?? []) byName.set(alias, entry);
}

/** Template name (or alias) → the pack manifest behind it. Throws if unknown. */
export const resolveTemplate = (name) => {
  const entry = byName.get(name);
  if (!entry) {
    throw new Error(
      `Unknown template "${name}". Available: ${Object.keys(TEMPLATES).join(', ')}. ` +
        'Call listTemplates() to see them with their formats and sample data.',
    );
  }
  return packById(entry.pack);
};

/**
 * Every template this runtime can render, with what a consumer needs to use it.
 *
 * `samples` are the documents shipped with each pack — real, valid data, which
 * makes a consumer's first render a copy-paste rather than a schema-reading
 * exercise.
 */
export const listTemplates = () =>
  Object.entries(TEMPLATES).map(([name, entry]) => {
    const pack = packById(entry.pack);
    return {
      name,
      aliases: entry.aliases ?? [],
      title: pack.title,
      summary: entry.summary,
      component: entry.component,
      formats: pack.formats,
      samples: pack.samples.map((sample) => ({ id: sample.id, title: sample.title ?? sample.id })),
    };
  });

/**
 * A shipped sample document, for demos, storybooks and first renders.
 * Omit `sampleId` for the template's default.
 */
export const getTemplateSample = (name, sampleId) => {
  const pack = resolveTemplate(name);
  if (sampleId === undefined) return pack.samples[0];

  const found = pack.samples.find((sample) => sample.id === sampleId);
  if (!found) {
    throw new Error(
      `Template "${name}" has no sample "${sampleId}". ` +
        `Available: ${pack.samples.map((s) => s.id).join(', ')}.`,
    );
  }
  return found;
};

/** Every sample for a template — what a "pick a player" dropdown is built from. */
export const getTemplateSamples = (name) => resolveTemplate(name).samples;

/** Internal: the catalogue keyed by pack id, for the named component exports. */
export const templateEntries = () =>
  Object.entries(TEMPLATES).map(([name, entry]) => ({ name, ...entry }));

/** Sanity check at module load — a catalogue entry naming a missing pack is a build error. */
for (const entry of Object.values(TEMPLATES)) {
  if (!PACKS.some((pack) => pack.id === entry.pack)) {
    throw new Error(
      `Template catalogue references unknown pack "${entry.pack}". ` +
        'Check src/runtime/templates.js against src/packs/registry.js.',
    );
  }
}
