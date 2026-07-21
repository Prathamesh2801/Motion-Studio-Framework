/**
 * Showcase content.
 *
 * Media is generated as inline SVG data URIs rather than shipped as files. The
 * showcase must render on a clean checkout with no asset step — if validating
 * the framework required first sourcing artwork, it would stop being run.
 *
 * A real project uses `assetsFor(project)` instead; see `framework/assets`.
 */

const encode = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

/** A labelled gradient panel, for anywhere the film needs stand-in media. */
export const swatch = (label, from, to, { width = 800, height = 600 } = {}) =>
  encode(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}"/>
          <stop offset="100%" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
      <text x="${width / 2}" y="${height / 2}" fill="rgba(255,255,255,0.72)"
            font-family="monospace" font-size="${Math.round(width / 18)}"
            text-anchor="middle" dominant-baseline="middle">${label}</text>
    </svg>`,
  );

/** Deliberately long copy, for the layout chapters and the torture test. */
export const LOREM =
  'Layout decides reflow once, so a scene never asks which format it is in. ' +
  'The same component tree becomes a row on an ultrawide banner and a column on a phone.';

export const SUBSYSTEMS = [
  { id: 'motion', title: 'Motion', description: 'Pure frame → style functions.' },
  { id: 'camera', title: 'Camera', description: 'Named moves, seeded and reproducible.' },
  { id: 'layout', title: 'Layout', description: 'Reflow decided once, by the layout.' },
  { id: 'timeline', title: 'Timeline', description: 'Swappable timebases.' },
];

export const STATS = [
  { id: 'templates', value: 12, label: 'Scene templates' },
  { id: 'layouts', value: 5, label: 'Layout primitives' },
  { id: 'buckets', value: 4, label: 'Format buckets' },
  { id: 'timebases', value: 3, label: 'Timebases' },
];
