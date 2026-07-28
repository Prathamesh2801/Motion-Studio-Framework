/**
 * The data engine (Ring 2.5) — public API.
 *
 * What a data document IS, what a ViewModel IS, and how you get from one to the
 * other. Knows nothing about football, about React, or about which host is
 * rendering. Packs import from here; so does the editor.
 *
 * Dependency rule: this ring may import Ring 1 (`@/framework`) and Remotion, and
 * nothing outward. It must never import a pack — the flow is
 * `packs → engine`, never back.
 */

export {
  assetSchema,
  metricSchema,
  metricFormatSchema,
  metricEmphasisSchema,
  chipSchema,
  contextItemSchema,
  themeRefSchema,
  assetIsRenderable,
} from './schema/primitives.js';

export {
  DOCUMENT_VERSION,
  PACE,
  documentSchema,
  packDocumentSchema,
  migrateDocument,
} from './schema/document.js';

export {
  subjectSchema,
  viewModelSchema,
  assertViewModel,
  heroMetric,
  boundedMetrics,
  emptyViewModel,
} from './viewmodel.js';

export { toAsset, resolveAsset, unrenderableAssets } from './assets.js';

export { toNumber, normalizeMetric, normalizeViewModel, normalizeDocument } from './normalize.js';

export { validateDocument, explainIssues, formatIssues, issuesFor } from './validate.js';

export { getAtPath, setAtPath, applyPatch, patchMatches } from './patch.js';
