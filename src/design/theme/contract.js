/**
 * The theme CONTRACT (Ring 2).
 *
 * Every brand theme must satisfy this shape so framework components can rely on
 * `theme.colors.text.primary`, `theme.typography.textStyles`, `theme.radii.lg`
 * etc. regardless of which brand is active. Only the VISUAL half of the design
 * system lives here — motion tokens are static in `framework/motion`, and the
 * structural `layout`/`zIndex` tokens live in `framework/formats`.
 *
 * @typedef {Object} Theme
 * @property {Object} colors      primary/secondary/accent, background/surface,
 *                                text.{primary,secondary,muted,inverse,onAccent},
 *                                border(s), shade.*, gradients.*
 * @property {Object} typography  fontFamilies, fontWeights, fontSizes,
 *                                lineHeights, letterSpacings, textStyles, fontStacks
 * @property {Object} spacing     named 8px scale (xs..xxxl) + `none`
 * @property {Object} radii       corner radii (xs..xxl, pill, circle)
 * @property {Object} shadows     box-shadow elevation scale (sm..xl, none)
 * @property {Object} dropShadows filter drop-shadow values (product, soft, none)
 * @property {Object} glows       coloured bloom box-shadows
 * @property {Object} strokes     inset hairlines + raised top highlight
 * @property {Object} blurs       named blur radii (sm..ambient)
 */

/**
 * The tokens a theme MUST provide, as `path -> kind`.
 *
 * This is deliberately a shallow structural check, not a schema. It exists to
 * convert one specific failure — a brand that forgets a token — from a silent
 * wrong render into a build error naming the missing path.
 *
 * Without it, `theme.colors.text.primary` on an incomplete brand is `undefined`,
 * which React happily accepts: the style property is dropped, the text inherits
 * whatever colour is behind it, and you get a frame that is *plausible* rather
 * than correct. That is the worst outcome, because it survives review.
 *
 * Only load-bearing tokens are listed. Optional groups (`glows`, `strokes`,
 * `blurs`) are omitted on purpose: a brand may legitimately not define them, and
 * a contract that forbids reasonable themes stops being consulted.
 */
const REQUIRED = {
  'colors.primary': 'string',
  'colors.secondary': 'string',
  'colors.accent': 'string',
  'colors.background': 'string',
  'colors.surface': 'string',
  'colors.border': 'string',
  'colors.text.primary': 'string',
  'colors.text.secondary': 'string',
  'colors.text.muted': 'string',
  'colors.text.inverse': 'string',
  'colors.text.onAccent': 'string',
  'colors.shade': 'object',
  'colors.gradients': 'object',
  'typography.fontStacks': 'object',
  'typography.fontWeights': 'object',
  'typography.fontSizes': 'object',
  'typography.textStyles': 'object',
  spacing: 'object',
  radii: 'object',
  shadows: 'object',
  dropShadows: 'object',
};

/** Text styles every framework component assumes exist. */
const REQUIRED_TEXT_STYLES = [
  'hero',
  'sectionTitle',
  'cardTitle',
  'subtitle',
  'description',
  'caption',
  'eyebrow',
];

const at = (object, path) =>
  path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), object);

/**
 * Validate a theme against the contract. Returns the theme so it can be used
 * inline; throws an Error listing EVERY problem rather than only the first,
 * because fixing a brand one error per render cycle is miserable.
 *
 * @param {object} theme
 * @param {string} [label]  Name used in the error, e.g. the brand id.
 */
export const validateTheme = (theme, label = theme?.name ?? 'theme') => {
  if (!theme || typeof theme !== 'object') {
    throw new Error(`${label}: a theme object is required.`);
  }

  const problems = [];

  for (const [path, kind] of Object.entries(REQUIRED)) {
    const value = at(theme, path);
    if (value === undefined || value === null) {
      problems.push(`missing \`${path}\``);
    } else if (kind === 'object' && typeof value !== 'object') {
      problems.push(`\`${path}\` should be an object, got ${typeof value}`);
    } else if (kind === 'string' && typeof value !== 'string') {
      problems.push(`\`${path}\` should be a string, got ${typeof value}`);
    }
  }

  const textStyles = at(theme, 'typography.textStyles');
  if (textStyles && typeof textStyles === 'object') {
    for (const style of REQUIRED_TEXT_STYLES) {
      if (!textStyles[style]) problems.push(`missing \`typography.textStyles.${style}\``);
    }
  }

  if (problems.length) {
    throw new Error(
      `Invalid theme "${label}":\n  - ${problems.join('\n  - ')}\n` +
        'See src/design/theme/contract.js for the full contract.',
    );
  }

  return theme;
};

/**
 * Deep-merge `overrides` onto a base theme to build a brand. Plain objects merge
 * recursively; everything else (strings, numbers, arrays) is replaced. This is
 * how `design/brands/<brand>` extends the default theme by touching only the
 * tokens that differ.
 */
export const extendTheme = (base, overrides = {}) => {
  const isPlain = (v) =>
    v && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;

  const merge = (a, b) => {
    const out = { ...a };
    for (const [key, value] of Object.entries(b)) {
      out[key] = isPlain(value) && isPlain(a?.[key]) ? merge(a[key], value) : value;
    }
    return out;
  };

  return merge(base, overrides);
};
