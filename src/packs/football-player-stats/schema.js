import { z } from 'zod';
// Relative, not `@/engine` — this file is pure and must load in plain Node so
// `npm test` can assert it without a bundler. See the note in `timeline.js`.
import { assetSchema } from '../../engine/schema/primitives.js';
import { packDocumentSchema } from '../../engine/schema/document.js';

/**
 * The football document's payload.
 *
 * ── WHY THIS IS WRITTEN IN FOOTBALL, NOT IN ViewModel ───────────────────────
 * This is the one place in the system where the JSON is allowed to talk about
 * clubs, jerseys and goals — because a human writes it and has to recognise it.
 * A file that said `metrics: [{ label: 'Goals', value: 73 }]` would be a data
 * dump, not a document; you could not tell at a glance whether a player was
 * missing their assists.
 *
 * `adapter.js` converts this into the generic ViewModel. Everything downstream
 * of that conversion — every scene, component and animation — is sport-agnostic,
 * which is the entire architecture in one sentence.
 *
 * ── A NUMBER-OR-STRING UNION ON EVERY STAT ──────────────────────────────────
 * Hand-written and API-fetched JSON both produce `"73"` about as often as `73`.
 * `normalizeMetric` coerces the unambiguous cases and throws by name on the
 * rest, so the schema stays permissive here and strict one layer down. Rejecting
 * a string at the schema boundary would just move the same fix into the author's
 * text editor.
 */

const numeric = z.union([z.number(), z.string()]);

const nationalitySchema = z.object({
  name: z.string(),
  /** Three-letter code — also the flag filename by convention. */
  code: z.string().optional(),
  flag: assetSchema.optional(),
});

const clubSchema = z.object({
  name: z.string(),
  shortName: z.string().optional(),
  logo: assetSchema.optional(),
  /** The club colour. Promoted to `theme.accent` unless the document sets one. */
  color: z.string().nullable().default(null),
});

const leagueSchema = z.object({
  name: z.string(),
  country: z.string().optional(),
  logo: assetSchema.optional(),
});

/**
 * The five figures this pack presents.
 *
 * Named fields, not an array — because at the DOCUMENT level these are the
 * fixed shape of a football stat line, and naming them is what makes the file
 * reviewable. The array is what the adapter produces; the ceiling on `rating`
 * is what turns it into an arc without a component knowing why.
 */
const statsSchema = z.object({
  goals: numeric,
  assists: numeric,
  matches: numeric,
  minutes: numeric,
  rating: numeric,
  /** Ceiling for the rating. 10 in every league that publishes one. */
  ratingMax: numeric.default(10),
});

export const footballPlayerSchema = packDocumentSchema(
  z.object({
    player: z.object({
      name: z.string(),
      shortName: z.string().optional(),
      nickname: z.string().optional(),
      number: numeric.optional(),
      position: z.string().optional(),
      nationality: nationalitySchema,
      portrait: assetSchema.optional(),
    }),
    club: clubSchema,
    league: leagueSchema,
    season: z.string(),
    competition: z.string(),
    stats: statsSchema,
  }),
);

export default footballPlayerSchema;
