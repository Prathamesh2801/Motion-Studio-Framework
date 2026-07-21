import { extendTheme, validateTheme } from '../../theme/contract.js';
import { tokens } from '../../theme/tokens.js';
import { loadFonts } from '../../fonts/index.js';
import { stackFor } from '../../fonts/stacks.js';
import { alpha } from '../../../framework/helpers/color.js';

/**
 * "Atelier" — the brand for the film *From Idea to Reality*.
 *
 * ── WHY A BRAND AND NOT PER-SCENE OVERRIDES ─────────────────────────────────
 * The film rests on one idea, and the idea is a COLOUR ARGUMENT: amber is the
 * human (the idea, the doubt, the decision to begin) and indigo is the system
 * (structure, repetition, alignment). The film's ending is warm on purpose —
 * the finished thing belongs to a person, not to the machine that built it.
 *
 * An argument that runs for 85 seconds should be stated once, in one file, not
 * re-derived at nineteen call sites. That is precisely what a brand is for.
 *
 * Unlike `editorial`, this brand does NOT invert the default. It keeps the
 * near-black ground and the indigo primary, and changes three things:
 *
 *   1. accent  rose → amber, so the film has a true warm hue to argue with
 *   2. display Manrope → Instrument Serif, so titles read as film, not product
 *   3. atmosphere retuned so `hearth` is warm and `flat` is genuinely empty
 *
 * Everything else is inherited. Touching only what differs is what keeps a
 * brand readable and what makes a framework fix reach this film for free.
 */

// ── Fonts ───────────────────────────────────────────────────────────────────
// Instrument Serif ships ONE weight (400) and an italic — no 600/700/800. The
// default display weights would ask the loader for faces that do not exist and
// leave the browser to synthesise a fake bold, which on a high-contrast serif
// smears the thin strokes and looks like a rendering bug. So the weights are
// stated explicitly here, and `textStyles` below drops every display style to
// 400 to match. A brand owns its faces AND the weights those faces can honour.
loadFonts(
  { display: 'instrumentSerif', body: 'inter', mono: 'jetbrainsMono' },
  { display: ['400'], body: ['400', '500', '600'], mono: ['400', '500'] },
);

/**
 * The warm half of the argument. Deliberately golden rather than orange: at
 * `hearth` intensities an orange glow reads as a warning light, and a yellow
 * one reads as a lamp. Gold reads as evening.
 */
const amber = {
  200: '#fde8c4',
  300: '#f8d199',
  400: '#f0b45f',
  500: '#e09a3a',
  600: '#c17c26',
};

const ink = tokens.colors;

export const atelierTheme = validateTheme(
  extendTheme(tokens, {
    name: 'atelier',

    colors: {
      // `primary` (indigo) is INHERITED — it is the system's colour and the
      // default's indigo is already right for it.

      // Rose → amber. Rose reads as *alert*; this film needs *hearth*.
      accent: amber[400],
      accentLight: amber[300],

      gradients: {
        // The human beats. A breath of gold in the centre of the frame, so the
        // warmth is in the ATMOSPHERE and not only in the objects lit by it.
        // 0.055, not the 0.14 this started at. A tint applied across the whole
        // canvas stops reading as light and becomes a colour cast — the first
        // render came back brown rather than warm. Warmth has to arrive as a
        // POOL with darkness around it, which means the gradient stays nearly
        // black and the atmosphere's glow does the work.
        hearth: `radial-gradient(110% 85% at 50% 44%, ${alpha(amber[500], 0.055)} 0%, ${ink.background} 52%, ${ink.backgroundDeep} 100%)`,
        // Gradient text runs paper → gold rather than paper → indigo.
        text: `linear-gradient(100deg, ${ink.text.primary} 0%, ${amber[300]} 100%)`,
        brand: `linear-gradient(120deg, ${amber[500]} 0%, ${amber[400]} 100%)`,
      },
    },

    typography: {
      fontFamilies: { display: 'Instrument Serif', body: 'Inter', mono: 'JetBrains Mono' },
      fontStacks: {
        display: stackFor('instrumentSerif'),
        body: stackFor('inter'),
        mono: stackFor('jetbrainsMono'),
      },

      /**
       * Serif display styles, retuned. Two corrections, both mandatory:
       *
       *   fontWeight    → 400 everywhere the display face is used. The face has
       *                   no other weight (see the font note above).
       *   letterSpacing → far less negative. The default's -0.035em was drawn
       *                   for a geometric sans with flat sidebearings; on a
       *                   serif it collides the serifs and the line reads as a
       *                   printing fault. Instrument Serif is already narrow,
       *                   so it wants air, not compression.
       *
       * Only the deltas appear — `extendTheme` deep-merges, so `family`,
       * `fontSize` and the rest survive untouched.
       */
      textStyles: {
        hero: { fontWeight: 400, letterSpacing: '-0.012em', lineHeight: 1.06 },
        sectionTitle: { fontWeight: 400, letterSpacing: '-0.008em', lineHeight: 1.16 },
        cardTitle: { fontWeight: 400, letterSpacing: '-0.004em' },
        cta: { fontWeight: 400, letterSpacing: '-0.004em' },
        stat: { fontWeight: 400, letterSpacing: '-0.01em' },
      },
    },

    // The accent bloom must be gold, or every "emphasis" in the film is rose.
    glows: {
      accent: `0 0 70px ${alpha(amber[400], 0.32)}`,
      accentSoft: `0 0 120px ${alpha(amber[400], 0.2)}`,
    },

    /**
     * ── ATMOSPHERE: THE FILM'S WEATHER ──────────────────────────────────────
     * The storyboard treats the four atmosphere recipes as dramatic states, so
     * the brand states what each one means in THIS film. The recipe vocabulary
     * stays in Ring 1 (every brand has a "hearth"); what a hearth looks like is
     * this brand's business.
     */
    atmosphere: {
      /**
       * `flat` — the Void and the Doubt. The default is a mild backdrop; here
       * it has to read as ABSENCE. Deeper vignette closes the frame in, and
       * with no glows at all the only thing on screen is grain, which is what
       * keeps the shot reading as space rather than as a failed render.
       */
      flat: { glows: [], vignette: 0.34, grain: 0.045 },

      /**
       * `hearth` — the Spark, the First mark, the Form, the Title. One warm
       * amber pool, centred and large. This is the film's home and the only
       * place the audience is allowed to feel safe.
       */
      hearth: {
        glows: [
          {
            color: amber[400],
            // Contained. A pool you can see the edge of, not a wash: the light
            // has to fall off inside the frame or the corners never go black,
            // and it is the black corners that make the warmth mean anything.
            position: { x: 50, y: 46 },
            size: 82,
            intensity: 0.2,
            ambientOptions: { amplitude: 8, period: 560 },
          },
        ],
        vignette: 0.4,
      },

      /**
       * `workshop` — Structure. The only recipe with `grid: true`, which is why
       * the storyboard puts it exactly where repetition begins: the grid
       * surfaces at the moment structure does. Cold indigo from above, like a
       * drafting lamp. No warmth here at all — that is the point of the beat.
       */
      workshop: {
        glows: [
          {
            color: ink.primary,
            position: { x: 50, y: 2 },
            size: 125,
            intensity: 0.22,
            ambientOptions: { amplitude: 6, period: 620 },
          },
        ],
        vignette: 0.36,
      },

      /**
       * `studio` — Momentum. The only beat where both forces are lit at once:
       * indigo overhead, amber from below. The peak of the film is also the
       * peak of its argument, and the two glows are literally in tension across
       * the frame.
       *
       * The default's second glow is `secondary` (cyan). Cyan was demoted in
       * the creative direction — three hues is one too many for a film this
       * spare — so it is replaced rather than added to.
       */
      studio: {
        glows: [
          {
            color: ink.primary,
            position: { x: 50, y: 4 },
            size: 115,
            intensity: 0.32,
            ambientOptions: { amplitude: 10, period: 520 },
          },
          {
            color: amber[400],
            position: { x: 50, y: 96 },
            size: 80,
            intensity: 0.22,
            ambientOptions: { phase: 140, amplitude: 14, period: 460 },
          },
        ],
        vignette: 0.32,
      },
    },
  }),
  'atelier',
);

/** The film's palette, exported so scenes can reference the warm ramp by name. */
export const atelierAmber = amber;

export default atelierTheme;
