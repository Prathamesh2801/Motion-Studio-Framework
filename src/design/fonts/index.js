import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope';
import { loadFont as loadSora } from '@remotion/google-fonts/Sora';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadInstrumentSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';
import { FACE_META, FONT_FACES, SYSTEM, stackFor } from './stacks.js';

/**
 * Font loading (Ring 2 — fonts are a brand concern, not an engine concern).
 *
 * ── THE FAILURE THIS PREVENTS ───────────────────────────────────────────────
 * A webfont that has not finished loading does not throw — the browser silently
 * paints a fallback face. In a video that means the first N frames render in the
 * wrong typeface, at the wrong metrics, and therefore at the wrong line breaks.
 * Nothing fails; the film is just quietly broken, and you find out in the final
 * render or, worse, after delivery.
 *
 * `@remotion/google-fonts`' `loadFont()` wraps the load in Remotion's
 * `delayRender()`/`continueRender()`, so the renderer will not produce frame 0
 * until the font is ready. Loading through this registry is therefore the
 * difference between "usually correct" and "correct".
 *
 * ── WHY STATIC IMPORTS ──────────────────────────────────────────────────────
 * Every face is imported at the top of this file rather than looked up
 * dynamically. Remotion bundles statically; a dynamic `import(name)` cannot be
 * traced by the bundler and would fail at render time on a farm even though it
 * works in Studio. The cost is that the vocabulary is fixed here — which matches
 * the framework's discipline everywhere else: a small curated set, extended by
 * adding a registry entry.
 *
 *   const fonts = loadFonts({ display: 'manrope', body: 'inter' });
 *   // → { display: '"Manrope", system-ui, sans-serif', body: '…', mono: '…' }
 */

const loaders = {
  inter: loadInter,
  manrope: loadManrope,
  sora: loadSora,
  playfair: loadPlayfair,
  instrumentSerif: loadInstrumentSerif,
  jetbrainsMono: loadJetBrainsMono,
};

/** Register a face loaded elsewhere (a local @font-face, or another provider). */
export const registerFace = (name, { load, family, fallback = SYSTEM.sans, note } = {}) => {
  if (typeof load !== 'function') {
    throw new Error(`registerFace("${name}"): \`load\` must be a function returning { fontFamily }.`);
  }
  if (!family) {
    throw new Error(`registerFace("${name}"): \`family\` (the CSS family name) is required.`);
  }
  loaders[name] = load;
  FACE_META[name] = { family, fallback, note };
  return FACE_META[name];
};

/**
 * Load one face and return a complete CSS font stack for it.
 *
 * Call at module scope, not inside a component: the `delayRender` handle must be
 * open before the renderer starts asking for frames.
 *
 * @param {string} name       A key from `FONT_FACES`.
 * @param {object} [options]
 * @param {string[]} [options.weights]  e.g. ['400','600','700'].
 * @param {string[]} [options.subsets]  Defaults to ['latin'].
 * @returns {string} A CSS `font-family` value.
 */
export const loadFace = (name, { weights, subsets = ['latin'] } = {}) => {
  const load = loaders[name];
  if (!load) {
    throw new Error(
      `font face: unknown name "${name}". Known: ${Object.keys(loaders).join(', ')}. ` +
        'Add one with registerFace().',
    );
  }

  // `style` is the first positional arg; 'normal' covers every face we ship.
  const { fontFamily } = load('normal', { weights, subsets });

  // The codegen and the CSS mirror read family names from `stacks.js`, which is
  // a hand-written constant. Assert it agrees with what the loader actually
  // registered — otherwise Tailwind would reference a family nothing defines,
  // and the failure would show up as silently-unstyled text.
  const expected = FACE_META[name]?.family;
  if (expected && expected !== fontFamily) {
    throw new Error(
      `font face "${name}": stacks.js says the family is "${expected}", but the loader ` +
        `registered "${fontFamily}". Update FACE_META in design/fonts/stacks.js.`,
    );
  }

  return stackFor(name);
};

/**
 * Load a display/body/mono trio and return stacks ready for a theme's
 * `typography.fontStacks`.
 *
 * @param {object} spec  `{ display, body, mono }` — face names, or `null` to
 *                       leave that slot on the system stack.
 * @param {object} [weights]  Per-slot weight arrays.
 */
export const loadFonts = (
  { display = 'manrope', body = 'inter', mono = null } = {},
  weights = {},
) => ({
  display: display
    ? loadFace(display, { weights: weights.display ?? ['500', '600', '700', '800'] })
    : SYSTEM.sans,
  body: body ? loadFace(body, { weights: weights.body ?? ['400', '500', '600'] }) : SYSTEM.sans,
  mono: mono ? loadFace(mono, { weights: weights.mono ?? ['400', '500'] }) : SYSTEM.mono,
});

export { FONT_FACES, FACE_META, stackFor, SYSTEM as systemStacks };
