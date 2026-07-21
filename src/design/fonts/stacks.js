/**
 * Font stack STRINGS — pure data, no loading, no Remotion, no React.
 *
 * Split out from `fonts/index.js` so that anything which needs to know what a
 * stack looks like can import it without dragging in the loaders. The
 * `theme-to-css` codegen is the concrete reason: it runs in plain Node, and
 * `fonts/index.js` imports `@remotion/google-fonts`, which imports Remotion,
 * which cannot be loaded outside a bundle.
 *
 * The family names here are asserted against what `loadFont()` actually returns
 * (see `fonts/index.js`), so this file cannot silently drift from the loaders.
 */

/** System stacks, used as the fallback tail of every loaded stack. */
export const SYSTEM = {
  sans: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
};

/**
 * The curated faces: the CSS family name each one registers, and the system
 * stack that follows it.
 */
export const FACE_META = {
  inter: {
    family: 'Inter',
    fallback: SYSTEM.sans,
    note: 'Neutral UI/body workhorse. Excellent at small sizes and in captions.',
  },
  manrope: {
    family: 'Manrope',
    fallback: SYSTEM.sans,
    note: 'Geometric display sans. Confident headlines without feeling technical.',
  },
  sora: {
    family: 'Sora',
    fallback: SYSTEM.sans,
    note: 'Squarer display sans. Reads as product/tech.',
  },
  playfair: {
    family: 'Playfair Display',
    fallback: SYSTEM.serif,
    note: 'High-contrast editorial serif. Documentary and brand-film titles.',
  },
  instrumentSerif: {
    family: 'Instrument Serif',
    fallback: SYSTEM.serif,
    note: 'Lighter editorial serif. Quotes and pull-outs.',
  },
  jetbrainsMono: {
    family: 'JetBrains Mono',
    fallback: SYSTEM.mono,
    note: 'Monospace, for data, code and timecode readouts.',
  },
};

export const FONT_FACES = Object.keys(FACE_META);

/** The CSS `font-family` value for a face, including its fallback tail. */
export const stackFor = (name) => {
  const meta = FACE_META[name];
  if (!meta) {
    throw new Error(`font face: unknown name "${name}". Known: ${FONT_FACES.join(', ')}.`);
  }
  return `"${meta.family}", ${meta.fallback}`;
};
