import { z } from 'zod';

/**
 * Shared data primitives (Ring 2.5).
 *
 * These are the atoms every pack's schema is built from — a metric, an asset,
 * a chip, a theme reference. They live here rather than in a pack because they
 * are not football, cricket or product concepts: they are the vocabulary the
 * scene templates speak. A new pack composes these; it does not invent its own.
 *
 * Everything is deliberately permissive on INPUT and strict on OUTPUT: a
 * hand-written JSON file may say `"portrait": "players/messi.png"` and get a
 * full Asset object back. `normalize.js` does that widening; this file only
 * declares what is legal.
 */

/**
 * An image reference.
 *
 * The string form is the one humans write. It is a path RELATIVE to the pack's
 * public asset folder, never an absolute URL or a `staticFile()` call — the two
 * hosts resolve assets differently (Remotion through `staticFile`, the editor
 * through Vite's `/public`), and a document that hard-codes either one renders
 * in exactly one of them.
 *
 * `blob:` sources are accepted because the editor's drag-and-drop produces them,
 * but they are flagged: they do not survive a render (see `assetIsRenderable`).
 */
export const assetSchema = z.union([
  z.string(),
  z.object({
    src: z.string(),
    alt: z.string().optional(),
    /** How the image sits in its frame. Matches CSS `object-fit`. */
    fit: z.enum(['cover', 'contain']).optional(),
    /** CSS `object-position`, e.g. '50% 20%' to keep a face out of the crop. */
    focal: z.string().optional(),
  }),
]);

/** Number formatting, mirroring `helpers/format.js` + StatCard's `format` prop. */
export const metricFormatSchema = z.enum(['plain', 'separated', 'compact', 'decimal']);

/** How loudly a metric is presented. Drives WHICH scene shows it, not its style. */
export const metricEmphasisSchema = z.enum(['hero', 'normal', 'muted']);

/**
 * A single animated number.
 *
 * This is the most important shape in the system. Scenes render
 * `metrics.map(...)` and never name a metric, which is the entire reason the
 * same StatBoard serves goals, wickets, lap times and revenue.
 *
 * Two fields carry design decisions as DATA:
 *   `max`      present → the metric is bounded → render a bar/arc, not a counter.
 *              A rating of 7.9 means nothing without its 10; a goal tally has no
 *              ceiling. That difference belongs to the data, not to a component
 *              prop typed by hand per video.
 *   `emphasis` 'hero' → the metric is eligible for a full-frame spotlight beat.
 */
export const metricSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
  /** Overrides all numeric formatting. Use for values that are not really
   *  numbers, e.g. a lap time of "1:31.447". The counter still animates to
   *  `value`; only the printed string comes from here. */
  display: z.string().optional(),
  format: metricFormatSchema.default('separated'),
  decimals: z.number().int().min(0).max(4).default(0),
  prefix: z.string().default(''),
  suffix: z.string().default(''),
  max: z.number().positive().optional(),
  emphasis: metricEmphasisSchema.default('normal'),
});

/** A small labelled fact with an optional icon — crest, flag, league, kit. */
export const chipSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  icon: assetSchema.optional(),
});

/** A labelled string with no icon — season, competition, "as of" date. */
export const contextItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
});

/**
 * Which brand to mount, plus per-document deviations.
 *
 * `accent` exists so a club colour can come from the DATA. Without it every
 * club needs its own brand file, which is a design-system change per football
 * team — the definition of a system that does not scale. With it, Barcelona and
 * Manchester City are one brand and two hex codes.
 */
export const themeRefSchema = z.object({
  brand: z.string().default('default'),
  accent: z.string().nullable().default(null),
  /**
   * Deep-merged onto the brand via `extendTheme`. The escape hatch, kept
   * explicitly separate from `accent` so the common case stays one field.
   */
  overrides: z.record(z.string(), z.unknown()).default({}),
});

/** `true` when an asset would still resolve inside an MP4 render. */
export const assetIsRenderable = (asset) => {
  const src = typeof asset === 'string' ? asset : asset?.src;
  return typeof src === 'string' && src.length > 0 && !src.startsWith('blob:');
};
