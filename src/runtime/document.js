import { firstSample } from '@/packs/registry.js';

/**
 * Turning a consumer's `data` prop into a pack document (Ring 5).
 *
 * ── THE PROBLEM THIS SOLVES ─────────────────────────────────────────────────
 * Internally, a pack is driven by a DOCUMENT — an envelope (`$schema`, `pack`,
 * `id`, `format`, `theme`, `timing`) wrapped around a `data` payload. That
 * envelope is exactly the kind of internal concept the SDK is supposed to hide:
 * an external app fetching a player from its own API has a payload, not a
 * document, and should not have to learn the wrapper.
 *
 * So `data` accepts either:
 *
 *   a full document   { pack: 'football-player-stats', data: { player: … } }
 *   a bare payload    { player: …, club: …, stats: … }
 *
 * A payload is wrapped in an envelope here. The two are distinguished
 * structurally rather than by a flag, because asking the consumer to declare
 * which one they have re-introduces the concept the wrapping exists to hide.
 *
 * ── WHY DEFAULTS COME FROM THE PACK'S FIRST SAMPLE ──────────────────────────
 * A bare payload says nothing about theme or format. Inventing a default here
 * ('default' brand, landscape) would render every pack in a brand it was never
 * designed for — the football pack would come up in the generic studio theme
 * rather than a broadcast one. The pack's own first sample is the closest thing
 * to an authored "this is how this template is meant to look", so that is what
 * an unspecified payload inherits.
 */

/** A document has an envelope; a payload does not. */
const looksLikeDocument = (value) =>
  Boolean(value) &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  'data' in value &&
  ('pack' in value || '$schema' in value);

/**
 * @param {object} data      A document or a bare payload.
 * @param {object} pack      The pack manifest.
 * @param {object} overrides `{ format, theme, accent, pace }` from component props.
 *                           Explicit props always beat what the document says.
 * @returns {object} A document ready for `resolvePack`.
 */
export const toDocument = (data, pack, { format, theme, accent, pace } = {}) => {
  if (!data || typeof data !== 'object') {
    throw new Error(
      `<${pack.id}>: \`data\` must be an object — either a full document or the ` +
        'payload for this template. Received ' + JSON.stringify(data) + '.',
    );
  }

  const reference = firstSample(pack);

  const base = looksLikeDocument(data)
    ? data
    : {
        $schema: reference.$schema ?? 1,
        pack: pack.id,
        id: data.id ?? 'inline',
        format: reference.format,
        theme: reference.theme,
        timing: reference.timing,
        data,
      };

  // Props win over the document, and are applied without mutating the caller's
  // object — a consumer may well be passing something straight out of their
  // own state or query cache.
  const themeRef = {
    ...(base.theme ?? {}),
    ...(theme === undefined ? null : { brand: theme }),
    ...(accent === undefined ? null : { accent }),
  };

  return {
    ...base,
    pack: pack.id,
    format: format ?? base.format ?? pack.formats[0],
    theme: themeRef,
    timing: pace === undefined ? (base.timing ?? {}) : { ...(base.timing ?? {}), pace },
  };
};
