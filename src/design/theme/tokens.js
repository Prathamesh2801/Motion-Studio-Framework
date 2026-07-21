import { alpha } from '../../framework/helpers/color.js';
import { stackFor } from '../fonts/stacks.js';

/**
 * Default theme TOKEN VALUES (Ring 2) — pure data, no side effects.
 *
 * Split from `default.js` for one concrete reason: the `theme-to-css` codegen
 * runs in plain Node, and `default.js` triggers font *loading*, which imports
 * Remotion and cannot be evaluated outside a bundle. Everything here is plain
 * values and string interpolation, so both the bundler and a bare `node` can
 * read it.
 *
 * Note the deep import of `helpers/color.js` rather than the `@/framework`
 * barrel — same reason. The barrel pulls in React components.
 *
 * The look: a neutral, brand-agnostic DARK system — a near-black canvas with an
 * indigo/cyan/rose accent set and dark-appropriate atmosphere (glows lighten,
 * shadows stay cool). A brand is built with `extendTheme(defaultTheme, {…})` in
 * `design/brands/<brand>`, touching only the tokens that differ.
 *
 * Motion tokens are NOT here (static, in `framework/motion`); neither are
 * `layout`/`zIndex` (structural, in `framework/formats`).
 */

const palette = {
  indigo: { 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
  cyan: { 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2' },
  rose: { 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e' },
  ink: { 950: '#05060a', 900: '#08090d', 850: '#0d0f16', 800: '#12141c', 700: '#1a1d28' },
  paper: '#f4f5fa',
};

export const colors = {
  primary: palette.indigo[500],
  primaryLight: palette.indigo[400],
  primaryDark: palette.indigo[600],
  primarySoft: palette.indigo[300],

  secondary: palette.cyan[400],
  secondaryLight: palette.cyan[300],
  secondaryDark: palette.cyan[600],

  accent: palette.rose[400],
  accentLight: palette.rose[300],

  background: palette.ink[900],
  backgroundDeep: palette.ink[950],

  surface: palette.ink[800],
  surfaceRaised: palette.ink[700],
  surfaceOverlay: 'rgba(255, 255, 255, 0.04)',

  border: 'rgba(255, 255, 255, 0.10)',
  borderStrong: 'rgba(255, 255, 255, 0.20)',

  text: {
    primary: palette.paper,
    secondary: 'rgba(244, 245, 250, 0.72)',
    muted: 'rgba(244, 245, 250, 0.46)',
    inverse: palette.ink[900],
    onAccent: '#ffffff',
  },

  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',

  /** Neutral (cool) shade values — every shadow draws from these. */
  shade: {
    soft: 'rgba(0, 0, 0, 0.28)',
    medium: 'rgba(0, 0, 0, 0.42)',
    strong: 'rgba(0, 0, 0, 0.55)',
    deep: 'rgba(0, 0, 0, 0.70)',
  },

  /** Reusable gradient definitions (CSS `background` values). */
  gradients: {
    canvas: `radial-gradient(125% 95% at 50% 8%, ${palette.ink[850]} 0%, ${palette.ink[900]} 52%, ${palette.ink[950]} 100%)`,
    studio: `radial-gradient(95% 75% at 50% 20%, ${palette.ink[800]} 0%, ${palette.ink[900]} 55%, ${palette.ink[950]} 120%)`,
    hearth: `radial-gradient(110% 85% at 50% 42%, ${palette.ink[800]} 0%, ${palette.ink[900]} 58%, ${palette.ink[950]} 100%)`,
    pool: `radial-gradient(ellipse at center, ${alpha('#000000', 0.5)} 0%, rgba(0,0,0,0) 70%)`,
    brand: `linear-gradient(120deg, ${palette.indigo[500]} 0%, ${palette.indigo[400]} 100%)`,
    surface: `linear-gradient(180deg, ${palette.ink[700]} 0%, ${palette.ink[800]} 100%)`,
    text: `linear-gradient(100deg, ${palette.paper} 0%, ${palette.indigo[300]} 100%)`,
    fadeUp: `linear-gradient(180deg, rgba(8,9,13,0) 0%, ${palette.ink[900]} 100%)`,
  },
};

/**
 * Which faces this theme uses. `default.js` passes this to `loadFonts()` to
 * actually fetch them; the stack STRINGS below are derived purely, so this file
 * stays evaluable outside a bundle.
 */
export const FONT_SPEC = { display: 'manrope', body: 'inter', mono: 'jetbrainsMono' };

export const fontStacks = {
  display: stackFor(FONT_SPEC.display),
  body: stackFor(FONT_SPEC.body),
  mono: stackFor(FONT_SPEC.mono),
};

const fontFamilies = { display: 'Manrope', body: 'Inter', mono: 'JetBrains Mono' };
const fontWeights = { regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 };
const fontSizes = {
  hero: 132,
  display: 96,
  title: 72,
  heading: 54,
  subheading: 40,
  body: 30,
  small: 24,
  caption: 20,
  micro: 16,
};
const lineHeights = { tight: 1.02, snug: 1.14, normal: 1.32, relaxed: 1.5 };
const letterSpacings = {
  tighter: '-0.035em',
  tight: '-0.02em',
  normal: '0em',
  wide: '0.06em',
  widest: '0.18em',
};

/** Named, ready-to-spread text styles. `family` is a token key resolved by `Text`. */
const textStyles = {
  hero: { family: 'display', fontSize: fontSizes.hero, fontWeight: fontWeights.extrabold, lineHeight: lineHeights.tight, letterSpacing: letterSpacings.tighter },
  sectionTitle: { family: 'display', fontSize: fontSizes.title, fontWeight: fontWeights.bold, lineHeight: lineHeights.snug, letterSpacing: letterSpacings.tight },
  cardTitle: { family: 'display', fontSize: fontSizes.heading, fontWeight: fontWeights.semibold, lineHeight: lineHeights.snug, letterSpacing: letterSpacings.tight },
  subtitle: { family: 'body', fontSize: fontSizes.subheading, fontWeight: fontWeights.medium, lineHeight: lineHeights.normal, letterSpacing: letterSpacings.normal },
  description: { family: 'body', fontSize: fontSizes.body, fontWeight: fontWeights.regular, lineHeight: lineHeights.relaxed, letterSpacing: letterSpacings.normal },
  caption: { family: 'body', fontSize: fontSizes.caption, fontWeight: fontWeights.medium, lineHeight: lineHeights.normal, letterSpacing: letterSpacings.normal },
  eyebrow: { family: 'mono', fontSize: fontSizes.micro, fontWeight: fontWeights.medium, lineHeight: lineHeights.normal, letterSpacing: letterSpacings.widest, textTransform: 'uppercase' },
  cta: { family: 'display', fontSize: fontSizes.subheading, fontWeight: fontWeights.semibold, lineHeight: lineHeights.snug, letterSpacing: letterSpacings.tight },
  stat: { family: 'display', fontSize: fontSizes.display, fontWeight: fontWeights.bold, lineHeight: lineHeights.tight, letterSpacing: letterSpacings.tighter, fontVariantNumeric: 'tabular-nums' },
};

export const typography = {
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacings,
  textStyles,
  fontStacks,
};

const BASE = 8;
export const spacing = {
  none: 0,
  xxs: BASE * 0.5,
  xs: BASE,
  sm: BASE * 2,
  md: BASE * 3,
  lg: BASE * 5,
  xl: BASE * 8,
  xxl: BASE * 12,
  xxxl: BASE * 18,
};

export const radii = { none: 0, xs: 8, sm: 14, md: 22, lg: 32, xl: 48, xxl: 64, pill: 9999, circle: '50%' };

export const shadows = {
  none: 'none',
  sm: `0 2px 8px ${colors.shade.soft}`,
  md: `0 8px 24px ${colors.shade.medium}`,
  lg: `0 20px 48px ${colors.shade.medium}`,
  xl: `0 36px 90px ${colors.shade.strong}`,
};

export const dropShadows = {
  product: `drop-shadow(0 16px 20px ${colors.shade.strong}) drop-shadow(0 44px 56px ${colors.shade.medium})`,
  soft: `drop-shadow(0 12px 24px ${colors.shade.medium})`,
  none: 'none',
};

/** On a dark ground, blooms lighten and read strongly. */
export const glows = {
  primary: `0 0 70px ${alpha(colors.primary, 0.35)}`,
  primarySoft: `0 0 110px ${alpha(colors.primary, 0.22)}`,
  secondary: `0 0 70px ${alpha(colors.secondary, 0.32)}`,
  accent: `0 0 70px ${alpha(colors.accent, 0.3)}`,
};

export const strokes = {
  inset: `inset 0 0 0 1px ${colors.border}`,
  insetStrong: `inset 0 0 0 1px ${colors.borderStrong}`,
  raised: `inset 0 1px 0 rgba(255, 255, 255, 0.08)`,
};

export const blurs = { sm: 8, md: 24, lg: 60, xl: 120, ambient: 220 };

/** Every token group, assembled. `default.js` adds the name and loads the fonts. */
export const tokens = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  dropShadows,
  glows,
  strokes,
  blurs,
};
