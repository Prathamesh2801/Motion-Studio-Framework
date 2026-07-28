import {
  defaultTheme,
  editorialTheme,
  atelierTheme,
  atelierAmber,
  broadcastNight,
  broadcastDay,
  terrace,
  extendTheme,
} from '@/design';
import { lighten } from '@/framework';

/**
 * Brand resolution for packs (Ring 3a).
 *
 * This lives here, not in `engine/`, on purpose. The engine must stay
 * brand-free — it describes what a document IS, and the moment it imports
 * `design/` it can no longer be reasoned about without knowing which brands
 * exist. Packs are the ring that legitimately knows both.
 *
 * The same argument the framework already makes about templates: a template
 * that imported the default theme would work perfectly and be silently unusable
 * for any other brand.
 */

/** Brand id (as written in a document's `theme.brand`) → theme object. */
export const BRANDS = {
  default: defaultTheme,
  editorial: editorialTheme,
  atelier: atelierTheme,
  atelierAmber,
  broadcastNight,
  broadcastDay,
  terrace,
};

/** Human labels for the editor's theme dropdown. Falls back to the id. */
export const BRAND_LABELS = {
  broadcastNight: 'Broadcast — Night',
  broadcastDay: 'Broadcast — Day',
  terrace: 'Terrace — Club',
  default: 'Studio (default)',
  editorial: 'Editorial',
  atelier: 'Atelier',
  atelierAmber: 'Atelier Amber',
};

export const brandLabel = (id) => BRAND_LABELS[id] ?? id;

export const brandNames = () => Object.keys(BRANDS);

/**
 * Cache derived themes.
 *
 * `extendTheme` builds a NEW object every call, and a new theme identity means
 * `withTheme` misses its cache, which remounts the composition. In the editor
 * that fires on every keystroke. Keying on the request makes a repeated
 * resolution return the same object, so both caches stay warm.
 */
const derived = new Map();

/**
 * Resolve a document's `theme` reference into a theme object.
 *
 * @param {{brand?: string, accent?: string|null, overrides?: object}} ref
 * @param {string|null} [dataAccent]
 *   Accent carried on the ViewModel (a club colour from the data). The
 *   document's own `theme.accent` wins over it — an explicit choice in the
 *   document should beat one derived from the payload.
 */
export const resolveThemeRef = (ref = {}, dataAccent = null) => {
  const brandId = ref.brand ?? 'default';
  const base = BRANDS[brandId];
  if (!base) {
    throw new Error(
      `Unknown brand "${brandId}". Known: ${brandNames().join(', ')}. ` +
        'Add it to BRANDS in src/packs/theme.js.',
    );
  }

  const accent = ref.accent ?? dataAccent ?? null;
  const overrides = ref.overrides ?? {};
  if (!accent && Object.keys(overrides).length === 0) return base;

  const key = `${brandId}|${accent ?? ''}|${JSON.stringify(overrides)}`;
  const cached = derived.get(key);
  if (cached) return cached;

  // An accent is not one token. Two of the theme's gradients ENCODE the brand
  // colour — `brand` (fills and marks) and `text` (the hero title's gradient) —
  // so patching only `colors.accent` produces a frame where the eyebrow and rule
  // take the club's colour while the headline stays the brand's original. That
  // reads as a bug, and it is exactly what the first render of this pack did.
  //
  // The second stop of each is derived rather than asked for: a document should
  // supply one colour, not a colour ramp.
  const accentPatch = accent
    ? {
        colors: {
          accent,
          primary: accent,
          gradients: {
            brand: `linear-gradient(120deg, ${accent} 0%, ${lighten(accent, 0.28)} 100%)`,
            text: `linear-gradient(100deg, ${base.colors.text.primary} 0%, ${accent} 100%)`,
          },
        },
      }
    : {};

  const theme = extendTheme(extendTheme(base, accentPatch), overrides);
  derived.set(key, theme);
  return theme;
};
