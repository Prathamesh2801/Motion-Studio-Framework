/**
 * Package the built runtime as an installable module.
 *
 *   npm run build:runtime
 *
 * `vite build --config vite.runtime.config.js` produces the JS. This adds the
 * three things that turn a bundle into a package someone else can install:
 *
 *   1. a package.json naming it `@motion/runtime`, with peer dependencies
 *   2. the template assets, so a consumer has something to serve
 *   3. a README with the install-and-copy steps
 *
 * ── WHY THE ASSETS ARE COPIED IN ────────────────────────────────────────────
 * Templates reference `packs/<id>/<file>` and resolve them at runtime through
 * `staticFile()`. Those files are not importable modules, so a bundler cannot
 * pull them in — they have to be SERVED. Shipping them inside the package means
 * a consumer can copy one directory into their `public/` and be done, instead of
 * discovering the requirement through broken images.
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist/runtime');

if (!existsSync(join(dist, 'index.js'))) {
  console.error('dist/runtime/index.js is missing — run the vite build first.');
  process.exit(1);
}

const source = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

/**
 * Peers, not dependencies.
 *
 * Pinned to the exact versions this was built against, because Remotion refuses
 * to run with mismatched package versions and `<Player>` must share one React
 * instance with the consumer's app.
 */
const pkg = {
  name: '@motion/runtime',
  version: source.version,
  description:
    'Motion Runtime — execute Motion Studio templates as React components. Data in, animation out.',
  type: 'module',
  main: './index.js',
  module: './index.js',
  exports: {
    '.': { import: './index.js', default: './index.js' },
    './assets/*': './assets/*',
    './package.json': './package.json',
  },
  files: ['index.js', 'index.js.map', 'assets', 'README.md'],
  sideEffects: false,
  peerDependencies: {
    react: '^19.0.0',
    'react-dom': '^19.0.0',
    remotion: source.dependencies.remotion,
    '@remotion/player': source.dependencies['@remotion/player'],
    '@remotion/transitions': source.dependencies['@remotion/transitions'],
    '@remotion/google-fonts': source.dependencies['@remotion/google-fonts'],
    '@remotion/shapes': source.dependencies['@remotion/shapes'],
    '@remotion/media-utils': source.dependencies['@remotion/media-utils'],
    '@remotion/media': source.dependencies['@remotion/media'],
    zod: source.dependencies.zod,
  },
};

writeFileSync(join(dist, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

// Template assets, mirrored so `packs/<id>/…` resolves under the consumer's
// chosen `assetBase`.
mkdirSync(join(dist, 'assets'), { recursive: true });
cpSync(join(root, 'public/packs'), join(dist, 'assets/packs'), { recursive: true });

const readme = `# @motion/runtime

Execute Motion Studio templates as ordinary React components.

\`\`\`bash
npm install @motion/runtime
npm install react react-dom remotion @remotion/player \\
            @remotion/transitions @remotion/google-fonts \\
            @remotion/shapes @remotion/media-utils @remotion/media zod
\`\`\`

\`\`\`jsx
import { PlayerStatsTemplate } from '@motion/runtime';

<PlayerStatsTemplate data={player} />
\`\`\`

\`data\` is either the template's payload or a full document. Get a real one to
start from:

\`\`\`js
import { getTemplateSample, listTemplates } from '@motion/runtime';

listTemplates();                                    // what can be rendered
getTemplateSample('football-player', 'haaland');    // valid sample data
\`\`\`

## Assets

Templates load portraits, crests and flags at runtime. Copy them into whatever
your app serves statically:

\`\`\`bash
cp -r node_modules/@motion/runtime/assets/packs public/
\`\`\`

If they do not sit at your web root, say where they are:

\`\`\`jsx
<PlayerStatsTemplate data={player} assetBase="/motion-assets" />
\`\`\`

## Props

| Prop | Default | |
| --- | --- | --- |
| \`data\` | — | payload or document (required) |
| \`format\` | template's own | \`landscape\` · \`reel\` · \`square\` |
| \`theme\` | template's own | brand name |
| \`accent\` | from the data | hex colour override |
| \`pace\` | \`normal\` | \`tight\` · \`normal\` · \`relaxed\` |
| \`autoPlay\` / \`loop\` | \`true\` | |
| \`controls\` | \`false\` | built-in transport bar |
| \`fallback\` | \`null\` | rendered instead of the template on error |
| \`onError\` | — | \`(error) => void\` — bad data and render errors both |
| \`onReady\` | — | \`({width, height, fps, durationInFrames, durationInSeconds}) => void\` |

The component is responsive: it fills its container's width and takes its height
from the template's aspect ratio.

## Installing from a local checkout

Install the **tarball**, not the folder:

\`\`\`bash
npm pack ./dist/runtime            # in the Motion Studio repo
npm install ../motion-runtime-1.0.0.tgz
\`\`\`

\`npm install ./dist/runtime\` (or \`npm link\`) creates a **symlink**, and Node
then resolves this package's peers from the Motion Studio repo's own
\`node_modules\` — so your app ends up with two copies of React. The template
mounts, React's hook dispatcher is null inside \`<Player>\`, and you get:

\`\`\`
Cannot read properties of null (reading 'useMemo')
\`\`\`

If you need the symlink for live development, force a single copy:

\`\`\`js
// vite.config.js
export default defineConfig({
  resolve: { dedupe: ['react', 'react-dom', 'remotion', '@remotion/player'] },
});
\`\`\`

Publishing to a registry avoids this entirely — the package is copied into your
\`node_modules\` and peers resolve from your app.

## Not included

MP4 rendering. That needs a Node process and a headless browser — it stays in
Motion Studio (\`npx remotion render\`).
`;

writeFileSync(join(dist, 'README.md'), readme);

console.log(`@motion/runtime v${pkg.version} packaged in dist/runtime/`);
console.log('  index.js + sourcemap, package.json, README.md, assets/packs/');
console.log('  Install into another project with:  npm install <path-to>/dist/runtime');
