import { extendTheme, validateTheme } from '../../theme/contract.js';
import { tokens } from '../../theme/tokens.js';
import { loadFonts } from '../../fonts/index.js';
import { stackFor } from '../../fonts/stacks.js';
import { alpha } from '../../../framework/helpers/color.js';

/**
 * "Broadcast" — the sports-television brand family (Ring 2).
 *
 * Three themes ship from this one file because they are three states of ONE
 * design argument, not three designs: a night gallery, a day gallery, and a
 * club-coloured skin. Splitting them into three folders would triplicate the
 * typography and the atmosphere and let them drift, which is exactly the failure
 * `extendTheme` exists to prevent.
 *
 * ── THE ARGUMENT ────────────────────────────────────────────────────────────
 * Broadcast graphics are read once, at speed, from across a room, often over
 * moving footage. That forces three things the editorial brands do not need:
 *
 *   1. Numerals that dominate. A stat card is a NUMBER with a caption attached,
 *      not a sentence — so display weights go up, not down, and tracking goes
 *      tight. This is why the display face is Sora rather than a serif: at
 *      800 weight a high-contrast serif loses its thin strokes at broadcast
 *      distance and turns to mush.
 *   2. Ground that stays out of the way. The portrait and the crest carry the
 *      colour; the canvas is near-neutral so a club's actual palette is the
 *      only strong hue on screen. A branded background would fight every one
 *      of the twenty clubs this pack has to serve.
 *   3. Contrast that survives an accent. `text.onAccent` is committed to white
 *      here because club colours are overwhelmingly mid-to-dark; the light
 *      theme below is the one place that assumption is re-examined.
 *
 * The accent is deliberately NEUTRAL in all three. It is meant to be overridden
 * per document by the club's colour — see `packs/theme.js`. A brand that shipped
 * an opinionated accent would be fighting its own data on every render.
 */

loadFonts(
  { display: 'sora', body: 'inter', mono: 'jetbrainsMono' },
  { display: ['600', '700', '800'], body: ['400', '500', '600', '700'], mono: ['400', '500'] },
);

/** Cool neutral ground — a television gallery, not a product page. */
const slate = {
  950: '#05070c',
  900: '#080b12',
  850: '#0c1018',
  800: '#121722',
  700: '#1a2130',
  600: '#232c3e',
};

/**
 * Type: the numerals do the talking.
 *
 * Applied to all three themes. `stat` is the load-bearing style — it is what a
 * `StatCard` and a `CountUp` render — so it gets the heaviest weight and the
 * tightest tracking in the system.
 *
 * It does NOT set `fontVariantNumeric`: the base token already commits to
 * `tabular-nums`, and that is the right place for it. A counting number whose
 * glyphs have different widths visibly jitters as it animates, which is the
 * most common way a stat overlay looks amateur — so it is a property of every
 * stat in the system, not of this brand.
 */
const broadcastTypography = {
  fontFamilies: { display: 'Sora', body: 'Inter', mono: 'JetBrains Mono' },
  fontStacks: {
    display: stackFor('sora'),
    body: stackFor('inter'),
    mono: stackFor('jetbrainsMono'),
  },
  textStyles: {
    hero: { fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.94 },
    sectionTitle: { fontWeight: 700, letterSpacing: '-0.025em' },
    cardTitle: { fontWeight: 700, letterSpacing: '-0.015em' },
    stat: { fontWeight: 800, letterSpacing: '-0.04em' },
    eyebrow: { fontWeight: 600, letterSpacing: '0.24em' },
    caption: { fontWeight: 500, letterSpacing: '0.04em' },
  },
};

// ── Broadcast Night ─────────────────────────────────────────────────────────

const nightColors = {
  primary: '#f8fafc',
  primaryLight: '#ffffff',
  primaryDark: '#cbd5e1',
  primarySoft: alpha('#f8fafc', 0.16),

  secondary: '#38bdf8',
  secondaryLight: '#7dd3fc',
  secondaryDark: '#0284c7',

  // Neutral by design — the document's club colour replaces this.
  accent: '#e2e8f0',
  accentLight: '#f8fafc',

  background: slate[900],
  backgroundDeep: slate[950],

  surface: slate[850],
  surfaceRaised: slate[800],
  surfaceOverlay: 'rgba(255, 255, 255, 0.04)',

  border: 'rgba(255, 255, 255, 0.10)',
  borderStrong: 'rgba(255, 255, 255, 0.22)',

  text: {
    primary: '#f8fafc',
    secondary: alpha('#f8fafc', 0.78),
    muted: alpha('#f8fafc', 0.48),
    inverse: slate[950],
    onAccent: '#ffffff',
  },

  shade: {
    soft: 'rgba(2, 6, 23, 0.22)',
    medium: 'rgba(2, 6, 23, 0.38)',
    strong: 'rgba(2, 6, 23, 0.56)',
    deep: 'rgba(2, 6, 23, 0.76)',
  },

  gradients: {
    // Light from above, as a stadium is lit. The gallery look depends on the
    // frame being brighter at the top than the bottom.
    canvas: `radial-gradient(120% 90% at 50% 0%, ${slate[800]} 0%, ${slate[900]} 55%, ${slate[950]} 100%)`,
    studio: `radial-gradient(100% 80% at 50% 12%, ${slate[700]} 0%, ${slate[850]} 58%, ${slate[950]} 118%)`,
    hearth: `radial-gradient(110% 85% at 50% 38%, ${slate[800]} 0%, ${slate[900]} 60%, ${slate[950]} 100%)`,
    pool: `radial-gradient(ellipse at center, ${alpha('#000000', 0.55)} 0%, rgba(0,0,0,0) 70%)`,
    brand: `linear-gradient(120deg, ${slate[600]} 0%, ${slate[700]} 100%)`,
    surface: `linear-gradient(180deg, ${slate[800]} 0%, ${slate[850]} 100%)`,
    text: `linear-gradient(100deg, #ffffff 0%, #94a3b8 100%)`,
    fadeUp: `linear-gradient(180deg, rgba(8,11,18,0) 0%, ${slate[900]} 100%)`,
  },
};

export const broadcastNight = validateTheme(
  extendTheme(tokens, {
    name: 'broadcast-night',
    colors: nightColors,
    typography: broadcastTypography,
    // Squarer than the default. Broadcast furniture reads as panels and lower
    // thirds; a pill-soft stat card looks like a web component on a scoreboard.
    radii: { sm: 4, md: 6, lg: 10, xl: 14, xxl: 20 },
    glows: {
      primary: `0 0 60px ${alpha('#f8fafc', 0.10)}`,
      primarySoft: `0 0 100px ${alpha('#f8fafc', 0.06)}`,
      secondary: `0 0 60px ${alpha('#38bdf8', 0.22)}`,
      accent: `0 0 60px ${alpha('#e2e8f0', 0.16)}`,
    },
  }),
  'broadcast-night',
);

// ── Broadcast Day ───────────────────────────────────────────────────────────

const paper = { 50: '#ffffff', 100: '#f4f6fa', 200: '#e8ecf3', 300: '#d7dde8' };

export const broadcastDay = validateTheme(
  extendTheme(tokens, {
    name: 'broadcast-day',
    colors: {
      ...nightColors,
      primary: slate[900],
      primaryLight: slate[700],
      primaryDark: '#000000',
      primarySoft: alpha(slate[900], 0.1),

      accent: slate[800],
      accentLight: slate[700],

      background: paper[100],
      backgroundDeep: paper[200],
      surface: paper[50],
      surfaceRaised: '#ffffff',
      surfaceOverlay: 'rgba(5, 7, 12, 0.03)',

      border: 'rgba(5, 7, 12, 0.12)',
      borderStrong: 'rgba(5, 7, 12, 0.24)',

      text: {
        primary: slate[950],
        secondary: alpha(slate[950], 0.74),
        muted: alpha(slate[950], 0.5),
        inverse: paper[50],
        // Still white. Club colours are overwhelmingly mid-to-dark, so a light
        // theme that flipped this to near-black would fail on the majority of
        // the data this pack exists to render.
        onAccent: '#ffffff',
      },

      shade: {
        soft: 'rgba(15, 23, 42, 0.08)',
        medium: 'rgba(15, 23, 42, 0.14)',
        strong: 'rgba(15, 23, 42, 0.22)',
        deep: 'rgba(15, 23, 42, 0.34)',
      },

      gradients: {
        canvas: `radial-gradient(120% 90% at 50% 0%, ${paper[50]} 0%, ${paper[100]} 55%, ${paper[200]} 100%)`,
        studio: `radial-gradient(100% 80% at 50% 12%, #ffffff 0%, ${paper[100]} 58%, ${paper[200]} 118%)`,
        hearth: `radial-gradient(110% 85% at 50% 38%, ${paper[50]} 0%, ${paper[100]} 60%, ${paper[300]} 100%)`,
        pool: `radial-gradient(ellipse at center, ${alpha(slate[900], 0.12)} 0%, rgba(0,0,0,0) 70%)`,
        brand: `linear-gradient(120deg, ${slate[800]} 0%, ${slate[600]} 100%)`,
        surface: `linear-gradient(180deg, #ffffff 0%, ${paper[100]} 100%)`,
        text: `linear-gradient(100deg, ${slate[950]} 0%, ${slate[600]} 100%)`,
        fadeUp: `linear-gradient(180deg, rgba(244,246,250,0) 0%, ${paper[100]} 100%)`,
      },
    },
    typography: broadcastTypography,
    radii: { sm: 4, md: 6, lg: 10, xl: 14, xxl: 20 },
    // On white, a bloom is invisible — emphasis becomes a soft shadow instead.
    // Same token keys, so components stay brand-agnostic.
    glows: {
      primary: `0 16px 40px ${alpha(slate[900], 0.16)}`,
      primarySoft: `0 24px 70px ${alpha(slate[900], 0.10)}`,
      secondary: `0 16px 40px ${alpha('#0284c7', 0.18)}`,
      accent: `0 16px 40px ${alpha(slate[800], 0.16)}`,
    },
  }),
  'broadcast-day',
);

// ── Terrace ─────────────────────────────────────────────────────────────────

/**
 * The club-forward skin: darker, tighter, and built to be dominated by whatever
 * accent the document supplies. Where Night keeps the club colour as a highlight,
 * Terrace lets it own the frame.
 */
export const terrace = validateTheme(
  extendTheme(tokens, {
    name: 'terrace',
    colors: {
      ...nightColors,
      background: '#04050a',
      backgroundDeep: '#000000',
      surface: 'rgba(255, 255, 255, 0.04)',
      surfaceRaised: 'rgba(255, 255, 255, 0.07)',
      border: 'rgba(255, 255, 255, 0.14)',
      gradients: {
        ...nightColors.gradients,
        canvas: `radial-gradient(130% 100% at 50% 100%, ${slate[850]} 0%, #04050a 60%, #000000 100%)`,
        studio: `radial-gradient(110% 90% at 50% 90%, ${slate[800]} 0%, #04050a 62%, #000000 120%)`,
        hearth: `radial-gradient(120% 95% at 50% 85%, ${slate[800]} 0%, #04050a 65%, #000000 100%)`,
      },
    },
    typography: broadcastTypography,
    radii: { sm: 2, md: 4, lg: 6, xl: 10, xxl: 14 },
  }),
  'terrace',
);
