import { z } from 'zod';
import { assetSchema, chipSchema, contextItemSchema, metricSchema } from './schema/primitives.js';

/**
 * The ViewModel (Ring 2.5) — the contract between DATA and MOTION.
 *
 * ── THE RULE THIS FILE EXISTS TO ENFORCE ────────────────────────────────────
 *   Scenes consume a ViewModel. Packs own the domain vocabulary.
 *
 * A scene that reads `data.player.goals` is a football scene forever. A scene
 * that reads `vm.metrics[i]` is a scene for football, cricket, F1, revenue and
 * churn. So the JSON stays human-readable — `player`, `club`, `goals` — and each
 * pack's `adapter.js` maps it into the generic shape below.
 *
 * The adapter is the ONLY file in the system allowed to contain a domain noun.
 * Everything downstream of it — every animation, layout, component and scene —
 * sees nothing but subjects, chips and metrics. `scripts/verify.mjs` enforces
 * that by grepping, because an architectural rule nobody checks is a comment.
 *
 * Nothing here is football. Read `subject` as "who or what is this about" and
 * every future pack fits: a driver, a batsman, a product, a quarter's revenue.
 */

/** Name, likeness and role of whatever the video is about. */
export const subjectSchema = z.object({
  name: z.string(),
  /** For tight frames and lockups where the full name will not fit. */
  shortName: z.string().optional(),
  /** Nickname, tagline, model number — the second line under the name. */
  secondaryName: z.string().optional(),
  /** Jersey number, car number, rank. A string: "10" and "01" both matter. */
  badgeValue: z.string().optional(),
  /** Position, discipline, category. */
  role: z.string().optional(),
  portrait: assetSchema.optional(),
});

export const viewModelSchema = z.object({
  subject: subjectSchema,
  /** Labelled facts with icons — crest, flag, league. Order = display order. */
  identity: z.array(chipSchema).default([]),
  /** The core array. Order = display order. Never keyed by domain name. */
  metrics: z.array(metricSchema).default([]),
  /** Season, competition, "as of" — the fine print strip. */
  context: z.array(contextItemSchema).default([]),
  assets: z
    .object({
      background: assetSchema.optional(),
      logo: assetSchema.optional(),
      watermark: assetSchema.optional(),
    })
    .default({}),
  /** Data-driven brand accent (club colour). Null → the brand's own accent. */
  accent: z.string().nullable().default(null),
});

/**
 * Validate an adapter's output.
 *
 * Adapters are the one place hand-written mapping code lives, so they are where
 * a typo turns into `undefined` flowing into a component. The framework already
 * refuses that class of bug at the theme boundary (`validateTheme`) and inside
 * StatCard (non-numeric `value` throws by name); this is the same guard at the
 * data boundary, and it is what makes the adapter unit-testable without a render.
 */
export const assertViewModel = (candidate, label = 'ViewModel') => {
  const result = viewModelSchema.safeParse(candidate);
  if (result.success) return result.data;

  const problems = result.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  throw new Error(
    `${label} is invalid:\n${problems}\n` +
      'The pack adapter produced this. See src/engine/viewmodel.js for the contract.',
  );
};

/** The metric a spotlight beat should feature, or null if the pack named none. */
export const heroMetric = (vm) => vm.metrics.find((m) => m.emphasis === 'hero') ?? null;

/** Metrics with a ceiling — these render as bars/arcs rather than counters. */
export const boundedMetrics = (vm) => vm.metrics.filter((m) => m.max !== undefined);

/**
 * An empty-but-valid ViewModel.
 *
 * The editor needs something to mount before a document is chosen, and a
 * half-built document mid-edit must not blank the preview. Rendering an empty
 * ViewModel is always legal; rendering `undefined` is a crash.
 */
export const emptyViewModel = () =>
  viewModelSchema.parse({ subject: { name: '' } });
