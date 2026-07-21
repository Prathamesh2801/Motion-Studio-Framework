import path from 'node:path';
import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind-v4';

/**
 * Remotion build/render configuration for Motion Studio Framework.
 * CLI flags always win over anything set here.
 *
 * ── TRAP ─────────────────────────────────────────────────────────────────────
 * Must be named `remotion.config.js` or `.ts` — those are the ONLY two names the
 * CLI looks for. A `.mjs` file is ignored SILENTLY: you lose the entry point,
 * the Tailwind pipeline and the `@/` alias, surfacing only as a confusing
 * "No Remotion entrypoint was found". The CLI bundles this to CommonJS and evals
 * it from the project root, so `import.meta` is unavailable here — use
 * `process.cwd()`.
 */

const projectRoot = process.cwd();

Config.setEntryPoint('./src/index.jsx');

// Visual fidelity: the motion language relies on gradients, glows and blurs.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(90);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(18);

Config.setChromiumOpenGlRenderer('angle');

/** Adds the `@/` -> `src/` alias declared in jsconfig.json to the bundler. */
const enableSrcAlias = (config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...config.resolve?.alias,
      '@': path.join(projectRoot, 'src'),
    },
  },
});

Config.overrideWebpackConfig((config) => enableSrcAlias(enableTailwind(config)));
