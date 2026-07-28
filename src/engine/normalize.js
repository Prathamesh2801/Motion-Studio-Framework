import { assertViewModel } from './viewmodel.js';
import { resolveAsset } from './assets.js';
import { migrateDocument } from './schema/document.js';

/**
 * Normalisation (Ring 2.5) — the widening layer between hand-written JSON and
 * the strict contracts.
 *
 * The contracts in `schema/` and `viewmodel.js` are strict on purpose: a metric
 * value must be a number, an id must exist. Hand-written JSON is not, and should
 * not have to be — a human writing `"goals": "73"` or omitting an id has made no
 * real mistake, and failing them for it produces a schema nobody wants to author
 * against.
 *
 * So: coerce what is unambiguous, fail loudly on what is not. `"73"` becomes 73;
 * `"seventy-three"` throws by name. The alternative — `Number("seventy-three")`
 * flowing on as `NaN` — renders a frame that says "NaN" and ships.
 */

/** Slug used when a metric or chip omits its id. Ids key React lists. */
const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';

/**
 * Coerce a numeric-ish value, naming the field when it is not numeric.
 * Mirrors StatCard's guard, one layer earlier — a document is a better place to
 * report the error than a component three rings down.
 */
export const toNumber = (value, field) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(String(value ?? '').trim());
  if (!Number.isFinite(parsed)) {
    throw new Error(
      `${field}: expected a number, got ${JSON.stringify(value)}. ` +
        'Put units in `prefix`/`suffix` rather than in the value.',
    );
  }
  return parsed;
};

/**
 * Widen one metric written by hand into the strict shape.
 * Accepts `{ label, value }` and fills everything else.
 */
export const normalizeMetric = (metric, index = 0) => {
  if (!metric || typeof metric !== 'object') {
    throw new Error(`metrics[${index}]: expected an object, got ${JSON.stringify(metric)}.`);
  }
  const label = metric.label ?? metric.id ?? `Metric ${index + 1}`;
  const decimals = metric.decimals ?? (metric.format === 'decimal' ? 1 : 0);
  return {
    id: metric.id ?? slugify(label),
    label,
    value: toNumber(metric.value, `metrics[${index}] ("${label}")`),
    display: metric.display,
    format: metric.format ?? 'separated',
    decimals,
    prefix: metric.prefix ?? '',
    suffix: metric.suffix ?? '',
    max: metric.max === undefined ? undefined : toNumber(metric.max, `metrics[${index}].max`),
    emphasis: metric.emphasis ?? 'normal',
  };
};

const normalizeChip = (chip, index, packId) => ({
  id: chip.id ?? slugify(chip.label ?? chip.value ?? `chip-${index}`),
  label: chip.label ?? '',
  value: String(chip.value ?? ''),
  icon: chip.icon ? resolveAsset(chip.icon, packId) : undefined,
});

/**
 * Take an adapter's raw output to a validated, asset-resolved ViewModel.
 *
 * This runs on EVERY edit in the editor, so it stays pure and cheap: no I/O, no
 * frame reads, no React. That is also what lets it be tested in plain Node
 * alongside the rest of the motion maths.
 *
 * @param {object} raw     Whatever `pack.adapter(document)` returned.
 * @param {object} options
 * @param {string} options.packId  Asset scope — `public/packs/<packId>/`.
 * @param {string} [options.label] Used in error messages.
 */
export const normalizeViewModel = (raw, { packId, label = 'ViewModel' } = {}) => {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`${label}: the pack adapter returned ${JSON.stringify(raw)}.`);
  }

  const subject = raw.subject ?? {};
  const normalized = {
    subject: {
      ...subject,
      name: subject.name ?? '',
      // Numbers are common here ("number": 10) and must print as written —
      // "01" and "1" are different jerseys.
      badgeValue: subject.badgeValue === undefined ? undefined : String(subject.badgeValue),
      portrait: subject.portrait ? resolveAsset(subject.portrait, packId) : undefined,
    },
    identity: (raw.identity ?? []).map((chip, i) => normalizeChip(chip, i, packId)),
    metrics: (raw.metrics ?? []).map(normalizeMetric),
    context: (raw.context ?? []).map((item, i) => ({
      id: item.id ?? slugify(item.label ?? `context-${i}`),
      label: item.label ?? '',
      value: String(item.value ?? ''),
    })),
    assets: Object.fromEntries(
      ['background', 'logo', 'watermark']
        .map((key) => [key, raw.assets?.[key] ? resolveAsset(raw.assets[key], packId) : undefined])
        .filter(([, value]) => value),
    ),
    accent: raw.accent ?? null,
  };

  return assertViewModel(normalized, label);
};

/** Migrate + parse a document against a pack's schema. Returns strict data. */
export const normalizeDocument = (document, schema) =>
  schema.parse(migrateDocument(document));
