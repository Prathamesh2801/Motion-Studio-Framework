import { z } from 'zod';
// Relative, not `@/engine` — this file is pure and must load in plain Node so
// `npm test` can assert it without a bundler. See the note in `timeline.js`.
import { assetSchema } from '../../engine/schema/primitives.js';
import { packDocumentSchema } from '../../engine/schema/document.js';

/**
 * The reference pack's payload schema.
 *
 * `subject-showcase` is deliberately DOMAIN-FREE: a subject, some facts, some
 * numbers. It exists to prove the pipeline (document → adapter → ViewModel →
 * both hosts) without a single football concept, and to stay as the worked
 * example a new pack is copied from.
 *
 * Note what a pack declares: only its own payload. The envelope — `$schema`,
 * `pack`, `format`, `theme`, `timing` — comes from `packDocumentSchema`, so no
 * pack can drift on the fields every host reads.
 */

const factSchema = z.object({
  label: z.string(),
  value: z.string(),
  icon: assetSchema.optional(),
});

/**
 * A number worth animating. `max` is optional and load-bearing: with a ceiling
 * the metric reads as a proportion (a bar), without one it reads as a tally (a
 * counter). That is a property of the number, so it belongs in the data.
 */
const figureSchema = z.object({
  label: z.string(),
  // Accepts "73" as well as 73 — `normalizeMetric` coerces and names the field
  // if it cannot. Hand-written JSON should not have to be type-perfect.
  value: z.union([z.number(), z.string()]),
  max: z.union([z.number(), z.string()]).optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  format: z.enum(['plain', 'separated', 'compact', 'decimal']).optional(),
  decimals: z.number().int().min(0).max(4).optional(),
  emphasis: z.enum(['hero', 'normal', 'muted']).optional(),
});

export const subjectShowcaseSchema = packDocumentSchema(
  z.object({
    subject: z.object({
      name: z.string(),
      shortName: z.string().optional(),
      tagline: z.string().optional(),
      badge: z.union([z.string(), z.number()]).optional(),
      role: z.string().optional(),
      portrait: assetSchema.optional(),
    }),
    facts: z.array(factSchema).default([]),
    figures: z.array(figureSchema).default([]),
    footnotes: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    accent: z.string().nullable().default(null),
    closing: z
      .object({
        title: z.string().optional(),
        line: z.string().optional(),
        website: z.string().optional(),
      })
      .default({}),
  }),
);

export default subjectShowcaseSchema;
