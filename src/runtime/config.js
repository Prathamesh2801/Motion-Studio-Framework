/**
 * Runtime configuration (Ring 5 — the SDK).
 *
 * One setting today: where the template's assets are served from.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * Packs address assets as `packs/<packId>/<file>`, resolved through Remotion's
 * `staticFile()`. Inside Studio and the renderer, Remotion sets
 * `window.remotion_staticBase` and everything lands correctly. In a plain React
 * app that global is unset, so `staticFile()` returns a ROOT-RELATIVE path —
 * `/packs/football-player-stats/players/messi.svg`. That only works if the
 * consuming site happens to serve the files at its own web root.
 *
 * `assetBase` lets a consumer say "the motion assets live at /motion-assets" or
 * point at a CDN. It works by setting the same global Remotion itself uses,
 * which is why no change to `engine/assets.js` was needed to support it.
 *
 * ── WHY IT IS APPLIED DURING RENDER, NOT IN AN EFFECT ───────────────────────
 * Asset paths are resolved while `resolvePack` runs, which happens during
 * render. An effect fires after that, so the first frame would resolve against
 * the wrong base and only correct itself on a later render — a flash of missing
 * images that is easy to ship and hard to reproduce.
 */

const trimTrailingSlash = (value) => String(value).replace(/\/+$/, '');

let applied = null;
let warned = false;

/**
 * Set the base URL that template assets are served from.
 *
 * Call once at app startup, or pass `assetBase` to a template component (which
 * calls this for you). Omit it entirely when the assets sit at the web root.
 *
 * @param {object} options
 * @param {string} options.assetBase e.g. '/motion-assets' or 'https://cdn.example.com/motion'
 */
export const configureMotionRuntime = ({ assetBase } = {}) => {
  if (assetBase === undefined || assetBase === null) return;
  if (typeof window === 'undefined') return;

  const next = trimTrailingSlash(assetBase);

  // Remotion Studio and the renderer set this themselves and are authoritative
  // about where their own public folder is. Overwriting it would break every
  // asset in Studio to fix a problem Studio does not have.
  const isHostManaged = window.remotion_staticBase && applied === null;
  if (isHostManaged) {
    if (!warned && trimTrailingSlash(window.remotion_staticBase) !== next) {
      warned = true;
      // eslint-disable-next-line no-console
      console.warn(
        `[motion-runtime] Ignoring assetBase "${next}": the host (Remotion Studio or the ` +
          `renderer) already serves assets from "${window.remotion_staticBase}".`,
      );
    }
    return;
  }

  if (applied === next) return;
  applied = next;
  window.remotion_staticBase = next;
};

/** The base currently in effect, or null when assets resolve from the web root. */
export const currentAssetBase = () =>
  typeof window === 'undefined' ? null : (window.remotion_staticBase ?? null);
