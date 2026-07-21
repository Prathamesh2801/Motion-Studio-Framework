import { extendTheme, validateTheme } from '../../theme/contract.js';
import { tokens } from '../../theme/tokens.js';
import { loadFonts } from '../../fonts/index.js';
import { stackFor } from '../../fonts/stacks.js';
import { alpha } from '../../../framework/helpers/color.js';

/**
 * "Editorial" — the second brand, and the proof that the theme system works.
 *
 * ── WHY THIS BRAND IS DELIBERATELY EXTREME ──────────────────────────────────
 * A second brand that is the default with different accent colours proves
 * almost nothing: any hardcoded value would survive it unnoticed. So this one
 * inverts every axis the framework could plausibly have baked in —
 *
 *   dark canvas          → light, warm paper
 *   geometric sans display → high-contrast editorial serif
 *   lightening glows     → darkening shadows (a bloom on white is invisible)
 *   cool neutral shades  → warm brown shades
 *
 * If a component hardcoded "text is near-white" or "shadows are black", this
 * brand makes it visible immediately rather than in six months on a client
 * project. That is the entire job of the file.
 *
 * It also demonstrates the intended authoring shape: `extendTheme` over the
 * default tokens, touching only what differs, then `validateTheme` so a missing
 * token fails here rather than mid-render.
 */

// Load the faces this brand needs. Like every theme, at module scope.
loadFonts({ display: 'playfair', body: 'inter', mono: 'jetbrainsMono' });

const paper = {
  50: '#fdfcfa',
  100: '#f7f4ee',
  200: '#efe9df',
  300: '#e2d9c9',
};

const ink = {
  900: '#1c1917',
  800: '#292524',
  700: '#44403c',
  500: '#78716c',
};

const brandColors = {
  primary: '#9a3412', // burnt sienna
  primaryLight: '#c2410c',
  primaryDark: '#7c2d12',
  primarySoft: '#fdba74',

  secondary: '#0f766e', // deep teal
  secondaryLight: '#14b8a6',
  secondaryDark: '#115e59',

  accent: '#a16207', // ochre
  accentLight: '#ca8a04',

  background: paper[100],
  backgroundDeep: paper[200],

  surface: paper[50],
  surfaceRaised: '#ffffff',
  surfaceOverlay: 'rgba(28, 25, 23, 0.03)',

  border: 'rgba(28, 25, 23, 0.12)',
  borderStrong: 'rgba(28, 25, 23, 0.24)',

  text: {
    primary: ink[900],
    secondary: ink[700],
    muted: ink[500],
    inverse: paper[50],
    onAccent: '#ffffff',
  },

  // Warm shades, not neutral black — on paper, cool shadows read as dirt.
  shade: {
    soft: 'rgba(68, 64, 60, 0.10)',
    medium: 'rgba(68, 64, 60, 0.16)',
    strong: 'rgba(68, 64, 60, 0.24)',
    deep: 'rgba(41, 37, 36, 0.36)',
  },

  gradients: {
    canvas: `radial-gradient(125% 95% at 50% 8%, ${paper[50]} 0%, ${paper[100]} 55%, ${paper[200]} 100%)`,
    studio: `radial-gradient(95% 75% at 50% 20%, #ffffff 0%, ${paper[100]} 58%, ${paper[200]} 120%)`,
    hearth: `radial-gradient(110% 85% at 50% 42%, ${paper[50]} 0%, ${paper[100]} 60%, ${paper[300]} 100%)`,
    pool: `radial-gradient(ellipse at center, ${alpha(ink[700], 0.14)} 0%, rgba(0,0,0,0) 70%)`,
    brand: `linear-gradient(120deg, #9a3412 0%, #c2410c 100%)`,
    surface: `linear-gradient(180deg, #ffffff 0%, ${paper[100]} 100%)`,
    text: `linear-gradient(100deg, ${ink[900]} 0%, #9a3412 100%)`,
    fadeUp: `linear-gradient(180deg, rgba(247,244,238,0) 0%, ${paper[100]} 100%)`,
  },
};

export const editorialTheme = validateTheme(
  extendTheme(tokens, {
    name: 'editorial-light',

    colors: brandColors,

    typography: {
      fontFamilies: { display: 'Playfair Display', body: 'Inter', mono: 'JetBrains Mono' },
      fontStacks: {
        display: stackFor('playfair'),
        body: stackFor('inter'),
        mono: stackFor('jetbrainsMono'),
      },
      // A high-contrast serif needs more air and less negative tracking than a
      // geometric sans — the same numbers would make Playfair look cramped.
      textStyles: {
        hero: { letterSpacing: '-0.015em', lineHeight: 1.06 },
        sectionTitle: { letterSpacing: '-0.01em' },
        cardTitle: { letterSpacing: '-0.005em' },
      },
    },

    // On paper, a bloom is invisible — so "glows" become soft warm shadows.
    // The token keys stay identical, which is what lets components be
    // brand-agnostic: they ask for `glows.primary` and get whatever this brand
    // thinks emphasis looks like.
    glows: {
      primary: `0 18px 40px ${alpha('#9a3412', 0.18)}`,
      primarySoft: `0 26px 70px ${alpha('#9a3412', 0.12)}`,
      secondary: `0 18px 40px ${alpha('#0f766e', 0.16)}`,
      accent: `0 18px 40px ${alpha('#a16207', 0.16)}`,
    },

    strokes: {
      inset: `inset 0 0 0 1px ${brandColors.border}`,
      insetStrong: `inset 0 0 0 1px ${brandColors.borderStrong}`,
      raised: `inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
    },

    /**
     * Atmosphere retuned for a light ground.
     *
     * This is the finding that building this brand actually produced: swapping
     * theme COLOURS is not enough, because the atmosphere recipes' structural
     * constants encode "dark ground" assumptions. On paper, a lightening glow is
     * invisible, `overlay` grain inverts into a dirty haze, and a black vignette
     * reads as a smudge rather than a falloff. So the brand states what those
     * atmospheres mean on its own canvas.
     */
    atmosphere: {
      // Every variant: barely-there grain, and grain that darkens rather than
      // lightens so it reads as paper tooth instead of fog.
      '*': { grain: 0.025, grainBlend: 'multiply', vignette: 0.06 },

      studio: {
        // One warm accent light only. The default's second (secondary-coloured)
        // glow was tinting the whole lower half green on paper.
        glows: [
          {
            color: brandColors.primary,
            position: { x: 50, y: 4 },
            size: 100,
            intensity: 0.07,
            ambientOptions: { amplitude: 8, period: 520 },
          },
        ],
      },

      hearth: {
        glows: [
          {
            color: brandColors.accent,
            position: { x: 50, y: 42 },
            size: 120,
            intensity: 0.06,
            ambientOptions: { amplitude: 8, period: 560 },
          },
        ],
      },

      workshop: {
        glows: [],
        // The rule grid is a dark hairline on paper, so it can stay — but the
        // vignette must not, or the corners look photocopied.
        vignette: 0.04,
      },

      flat: { glows: [], vignette: 0 },
    },
  }),
  'editorial-light',
);

export default editorialTheme;
