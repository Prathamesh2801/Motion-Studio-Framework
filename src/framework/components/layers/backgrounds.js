/**
 * Named atmosphere recipes — the two-pass scene background system.
 *
 * Recipes are THEME-DRIVEN: `backgroundsFor(theme)` builds the map from the
 * active theme's colours, so the same named atmosphere ("studio", "hearth", …)
 * renders correctly in any brand. Only colours come from the theme; the
 * structural values (glow positions/sizes, vignette/grain strength) are
 * aesthetic constants and stay inline.
 *
 * ── BRAND OVERRIDES ─────────────────────────────────────────────────────────
 * The default theme is dark, so the STRUCTURAL constants below are tuned for a
 * dark ground: glows lighten, grain blends with `overlay`, the vignette is a
 * subtle black. Those choices do not transfer. On light paper a lightening glow
 * is invisible, `overlay` grain inverts, and a black vignette reads as dirt at
 * the edges — swapping the colours alone is not enough.
 *
 * So a theme may carry an optional `atmosphere` map, merged per variant:
 *
 *   atmosphere: {
 *     studio: { vignette: 0.10, grainBlend: 'multiply', glows: [...] },
 *     '*':    { grain: 0.03 },        // applies to every variant
 *   }
 *
 * This keeps the recipe VOCABULARY in Ring 1 (every brand has a "studio") while
 * letting Ring 2 decide what that atmosphere means on its own ground.
 */
export const backgroundsFor = (theme) => {
  const { colors } = theme;
  const recipes = {
    /** Default beat. Soft overhead pool plus two drifting brand lights. */
    studio: {
      gradient: colors.gradients.studio,
      glows: [
        { color: colors.primary, position: { x: 50, y: 6 }, size: 110, intensity: 0.3, ambientOptions: { amplitude: 10, period: 520 } },
        { color: colors.secondary, position: { x: 92, y: 88 }, size: 60, intensity: 0.18, ambientOptions: { phase: 140, amplitude: 14, period: 460 } },
      ],
      grid: false,
      vignette: 0.3,
      grain: 0.05,
      grainBlend: 'overlay',
    },

    /** Brand moments — opening logo, end card. Warmest, cleanest, centred light. */
    hearth: {
      gradient: colors.gradients.hearth,
      glows: [
        { color: colors.primary, position: { x: 50, y: 44 }, size: 130, intensity: 0.26, ambientOptions: { amplitude: 8, period: 560 } },
      ],
      grid: false,
      vignette: 0.26,
      grain: 0.05,
      grainBlend: 'overlay',
    },

    /** A deeper, more technical beat — fine for "how it works" sections. */
    workshop: {
      gradient: colors.gradients.canvas,
      glows: [
        { color: colors.primary, position: { x: 50, y: 4 }, size: 120, intensity: 0.18, ambientOptions: { amplitude: 8, period: 600 } },
      ],
      grid: true,
      vignette: 0.34,
      grain: 0.05,
      grainBlend: 'overlay',
    },

    /** Flat canvas, minimal atmosphere. */
    flat: {
      gradient: colors.background,
      glows: [],
      grid: false,
      vignette: 0.18,
      grain: 0.04,
      grainBlend: 'overlay',
    },
  };

  const overrides = theme.atmosphere;
  if (!overrides) return recipes;

  // Shallow merge per variant: a brand replaces whole values (a `glows` array is
  // replaced, not concatenated — half-overriding a lighting rig produces
  // something nobody designed).
  const shared = overrides['*'] ?? {};
  const merged = {};
  for (const [variant, recipe] of Object.entries(recipes)) {
    merged[variant] = { ...recipe, ...shared, ...(overrides[variant] ?? {}) };
  }
  return merged;
};

export const BACKGROUND_VARIANTS = ['studio', 'hearth', 'workshop', 'flat'];

/** Resolve a variant name plus per-scene overrides into a full config. */
export const getBackground = (theme, variant = 'studio', overrides = {}) => {
  const map = backgroundsFor(theme);
  return { ...(map[variant] ?? map.studio), ...overrides };
};
