import { z } from 'zod';
import { themeRefSchema } from './primitives.js';

/**
 * The document envelope (Ring 2.5).
 *
 * Every pack's JSON — football today, cricket and F1 later — shares this outer
 * shape. Only `data` differs, and only the pack knows what is in it.
 *
 * The split exists so that the editor, the validator, the persistence layer and
 * the resolver can be written ONCE against the envelope and work for packs that
 * do not exist yet. Anything that needs to reach into `data` is, by definition,
 * pack-specific code.
 */

/** Bump when a breaking change to the envelope ships; `migrate()` reads it. */
export const DOCUMENT_VERSION = 1;

export const documentSchema = z.object({
  $schema: z.number().int().default(DOCUMENT_VERSION),
  /** Which pack renders this document. Must exist in `packs/registry.js`. */
  pack: z.string(),
  /** Stable slug — the filename, the editor's list key, the still's name. */
  id: z.string(),
  /** Human label for the editor's subject list. Falls back to `id`. */
  title: z.string().optional(),
  /** Default format. A host may override it (the editor's format switcher). */
  format: z.string().default('landscape'),
  theme: themeRefSchema.default({}),
  /**
   * Global pacing. Not a duration: a multiplier the pack's timeline applies to
   * its beat plan, so "make it snappier" is one field rather than an edit to
   * every scene length.
   */
  timing: z
    .object({ pace: z.enum(['tight', 'normal', 'relaxed']).default('normal') })
    .default({}),
  /** Pack-specific payload. Validated by `pack.schema`, not here. */
  data: z.unknown(),
});

/** Pace name → multiplier on the pack's authored beat lengths. */
export const PACE = { tight: 0.8, normal: 1, relaxed: 1.25 };

/**
 * Compose the envelope with a pack's own payload schema.
 *
 * A pack calls this instead of redeclaring the envelope, which is what keeps
 * `$schema`/`pack`/`format`/`theme` from drifting between packs — they drifted
 * across three projects in `projects/registry.js` before the registry existed,
 * and the same failure is available here.
 */
export const packDocumentSchema = (dataSchema) =>
  documentSchema.extend({ data: dataSchema });

/**
 * Bring an older document up to the current envelope version.
 *
 * A no-op today — there is exactly one version. It exists now because the
 * editor writes JSON files to disk that will outlive this month's schema, and
 * retrofitting migration once documents are in the wild means guessing which
 * shape each one was written against.
 */
export const migrateDocument = (document) => {
  if (!document || typeof document !== 'object') return document;
  const version = document.$schema ?? DOCUMENT_VERSION;
  if (version > DOCUMENT_VERSION) {
    throw new Error(
      `Document "${document.id ?? '?'}" declares $schema ${version}, but this build ` +
        `understands up to ${DOCUMENT_VERSION}. Update the app, or fix the document.`,
    );
  }
  return document;
};
