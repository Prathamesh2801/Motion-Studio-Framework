import { FORMATS, withTheme } from '@/framework';
import { normalizeViewModel, normalizeDocument, PACE, validateDocument } from '@/engine';
import { resolveThemeRef } from './theme.js';

/**
 * The pack resolver (Ring 3a) — the single wiring point both hosts mount through.
 *
 * ── WHY THIS FUNCTION EXISTS ────────────────────────────────────────────────
 * There are two hosts for the same composition: Remotion's <Composition> (which
 * renders the MP4) and <Player> (which drives the editor preview). The failure
 * mode to design out is DRIFT — the preview showing 1920x1080 under brand A
 * while the render produces 1080x1920 under brand B, each host having computed
 * its own dimensions, duration and theme wrapper.
 *
 * So neither host is allowed to compute any of that. Both call this, and get
 * back the exact props to mount. If they ever disagree, they disagree here, once,
 * for every pack — instead of silently, per project, forever.
 *
 * `projects/registry.js` already learned this lesson: three demos registered by
 * hand had each been wired slightly differently, and three of them bypassed the
 * theme provider entirely.
 */

/** `pack.duration` derives from `pack.timeline` so the two can never disagree. */
const durationOf = (pack, vm, fps, pace) => {
  const timeline = pack.timeline(vm, fps, pace);
  const frames = timeline?.durationInFrames;
  if (!Number.isFinite(frames) || frames <= 0) {
    throw new Error(
      `Pack "${pack.id}": timeline() returned no usable durationInFrames (got ${frames}). ` +
        'It must return a buildTimeline() result.',
    );
  }
  return Math.max(1, Math.round(frames));
};

/**
 * Document → everything needed to mount it, in either host.
 *
 * @param {object} pack        A pack manifest from `packs/registry.js`.
 * @param {object} document    A data document (the envelope + pack payload).
 * @param {string} [formatId]  Overrides the document's own `format`. The
 *                             editor's format switcher passes this; a render
 *                             passes the format it was asked for.
 * @returns {{component, inputProps, durationInFrames, fps, width, height, format, theme, vm}}
 */
export const resolvePack = (pack, document, formatId) => {
  if (!pack) throw new Error('resolvePack: a pack manifest is required.');

  const doc = normalizeDocument(document, pack.schema);

  const requested = formatId ?? doc.format;
  const format = FORMATS[requested];
  if (!format) {
    throw new Error(
      `resolvePack("${pack.id}"): unknown format "${requested}". ` +
        `Known: ${Object.keys(FORMATS).join(', ')}.`,
    );
  }

  const vm = normalizeViewModel(pack.adapter(doc), {
    packId: pack.id,
    label: `${pack.id}/${doc.id}`,
  });

  const pace = PACE[doc.timing.pace];
  const theme = resolveThemeRef(doc.theme, vm.accent);

  return {
    // `withTheme` is memoised on (component, theme), so a re-render with the
    // same brand returns the SAME component identity. Without that, every
    // keystroke in the editor would remount the composition and restart the
    // animation mid-type.
    component: withTheme(pack.Film, theme),
    inputProps: { vm, pace },
    durationInFrames: durationOf(pack, vm, format.fps, pace),
    fps: format.fps,
    width: format.width,
    height: format.height,
    // Passed back for the hosts' own UI (format label, theme swatches) — not
    // needed to mount, but computing them a second time is how drift starts.
    format,
    theme,
    vm,
  };
};

/**
 * The editor's door: same resolution, but issues instead of exceptions.
 *
 * Returns `{ ok, mount, issues }`. On failure `mount` is null and the caller is
 * expected to keep displaying the last successful mount — a half-typed document
 * is invalid by definition, and blanking the preview on every keystroke would
 * make the editor unusable.
 */
export const tryResolvePack = (pack, document, formatId) => {
  const check = validateDocument(document, pack.schema);
  if (!check.ok) return { ok: false, mount: null, issues: check.issues };

  try {
    return { ok: true, mount: resolvePack(pack, document, formatId), issues: [] };
  } catch (error) {
    // Adapter and normaliser failures land here — they throw plain Errors with
    // the offending field named, which is exactly what the editor wants to show.
    return { ok: false, mount: null, issues: [{ path: '', message: error.message }] };
  }
};
