/**
 * Generate placeholder assets for the football pack.
 *
 *   node scripts/make-football-placeholders.mjs
 *
 * ── WHY GENERATED, NOT DOWNLOADED ───────────────────────────────────────────
 * Real player photographs, club crests and league logos are somebody else's
 * intellectual property. Committing them to a template repo would make the repo
 * undistributable, and swapping them in later would be a licensing decision
 * nobody consciously made.
 *
 * So the pack ships abstract stand-ins that are unmistakably not the real thing:
 * an anonymous silhouette, a geometric shield with initials, a flag built from
 * its country's actual band layout. They prove the pipeline — every asset path
 * resolves, every layout is exercised at the right aspect ratio — and they are
 * replaced by dropping real files at the same paths. **No code changes when the
 * real assets arrive**, which is the property worth having.
 *
 * SVG rather than PNG for the same reason the flags are geometric: these are
 * generated shapes, and generating a raster would mean shipping a rasteriser.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'packs',
  'football-player-stats',
);

const write = (relative, contents) => {
  const path = join(root, relative);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents.trim() + '\n', 'utf8');
  return relative;
};

/**
 * An anonymous figure on a club-coloured wash.
 *
 * Portrait-shaped (3:4) and bottom-anchored, because that is how a real cutout
 * render behaves: head near the top, cropped at the chest. A centred circle
 * would let the layout look right here and break the day real photography lands.
 */
const portrait = (accent) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.85"/>
      <stop offset="70%" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="c"><rect x="0" y="0" width="600" height="800"/></clipPath>
  </defs>
  <g clip-path="url(#c)">
    <circle cx="300" cy="300" r="200" fill="url(#g)"/>
    <g fill="#0b0f18" fill-opacity="0.92">
      <circle cx="300" cy="250" r="88"/>
      <path d="M300 355c-104 0-188 72-188 162v163h376V517c0-90-84-162-188-162z"/>
    </g>
    <g fill="#ffffff" fill-opacity="0.08">
      <circle cx="300" cy="250" r="88"/>
    </g>
  </g>
</svg>
`;

/** A shield with the club's initials — a crest shape, not a crest. */
const crest = (initials, primary, secondary) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140">
  <path d="M60 4 8 22v54c0 32 22 52 52 60 30-8 52-28 52-60V22z" fill="${primary}"/>
  <path d="M60 4 8 22v54c0 32 22 52 52 60 30-8 52-28 52-60V22z" fill="none" stroke="${secondary}" stroke-width="5"/>
  <path d="M60 20 24 32v44c0 24 16 39 36 46 20-7 36-22 36-46V32z" fill="${secondary}" fill-opacity="0.22"/>
  <text x="60" y="88" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-size="42" font-weight="700" fill="#ffffff">${initials}</text>
</svg>
`;

/**
 * A flag from its real band layout — vertical or horizontal thirds, or a
 * cross — so ARG and FRA are visibly different countries rather than the same
 * rectangle in two palettes. Not the real flags: no emblems, no exact ratios.
 */
const flag = (layout, colors) => {
  const [a, b, c] = colors;
  const bands =
    layout === 'vertical'
      ? `<rect width="20" height="40" fill="${a}"/><rect x="20" width="20" height="40" fill="${b}"/><rect x="40" width="20" height="40" fill="${c}"/>`
      : layout === 'cross'
        ? `<rect width="60" height="40" fill="${a}"/><rect x="18" width="10" height="40" fill="${b}"/><rect y="15" width="60" height="10" fill="${b}"/>`
        : `<rect width="60" height="13.33" fill="${a}"/><rect y="13.33" width="60" height="13.34" fill="${b}"/><rect y="26.67" width="60" height="13.33" fill="${c}"/>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" width="60" height="40">
  ${bands}
  <rect width="60" height="40" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>
</svg>
`;
};

/** A league wordmark: a rounded plate with an abbreviation. */
const league = (abbr, tint) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" width="160" height="60">
  <rect width="160" height="60" rx="10" fill="${tint}"/>
  <text x="80" y="40" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-size="26" font-weight="700" letter-spacing="2" fill="#ffffff">${abbr}</text>
</svg>
`;

const CLUBS = {
  barcelona: { initials: 'FCB', primary: '#a50044', secondary: '#004d98' },
  'real-madrid': { initials: 'RM', primary: '#dcdcdc', secondary: '#00529f' },
  'man-city': { initials: 'MC', primary: '#6cabdd', secondary: '#1c2c5b' },
  psg: { initials: 'PSG', primary: '#004170', secondary: '#da291c' },
  'al-nassr': { initials: 'AN', primary: '#f5d130', secondary: '#0b4ea2' },
  inter: { initials: 'INT', primary: '#0068a8', secondary: '#12122c' },
};

const COUNTRIES = {
  arg: { layout: 'horizontal', colors: ['#74acdf', '#ffffff', '#74acdf'] },
  por: { layout: 'vertical', colors: ['#046a38', '#046a38', '#da291c'] },
  nor: { layout: 'cross', colors: ['#ba0c2f', '#ffffff', '#ffffff'] },
  fra: { layout: 'vertical', colors: ['#002395', '#ffffff', '#ed2939'] },
  esp: { layout: 'horizontal', colors: ['#aa151b', '#f1bf00', '#aa151b'] },
  eng: { layout: 'cross', colors: ['#ffffff', '#ce1124', '#ffffff'] },
};

const LEAGUES = {
  laliga: { abbr: 'LA LIGA', tint: '#0a2240' },
  'premier-league': { abbr: 'PREMIER', tint: '#3d195b' },
  'ligue-1': { abbr: 'LIGUE 1', tint: '#091c3e' },
  'saudi-pro-league': { abbr: 'SPL', tint: '#1a5c38' },
  ucl: { abbr: 'UCL', tint: '#0a1c4e' },
};

const PORTRAITS = {
  messi: '#a50044',
  ronaldo: '#f5d130',
  haaland: '#6cabdd',
  mbappe: '#004170',
  pedri: '#a50044',
  bellingham: '#dcdcdc',
};

const written = [];

for (const [id, accent] of Object.entries(PORTRAITS)) {
  written.push(write(`players/${id}.svg`, portrait(accent)));
}
for (const [id, spec] of Object.entries(CLUBS)) {
  written.push(write(`clubs/${id}.svg`, crest(spec.initials, spec.primary, spec.secondary)));
}
for (const [id, spec] of Object.entries(COUNTRIES)) {
  written.push(write(`flags/${id}.svg`, flag(spec.layout, spec.colors)));
}
for (const [id, spec] of Object.entries(LEAGUES)) {
  written.push(write(`leagues/${id}.svg`, league(spec.abbr, spec.tint)));
}

console.log(`Wrote ${written.length} placeholder assets to public/packs/football-player-stats/`);
console.log('Replace any file with a real asset at the same path — no code changes needed.');
