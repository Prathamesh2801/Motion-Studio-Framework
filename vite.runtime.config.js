import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Library build for `@motion/runtime`.
 *
 * Separate from `vite.config.js` because it produces something categorically
 * different: that one builds an APPLICATION (an index.html plus hashed assets),
 * this one builds a MODULE another application imports.
 *
 * ── WHY EVERYTHING REMOTION IS EXTERNAL ─────────────────────────────────────
 * Remotion requires every one of its packages to be on the same version, and
 * `<Player>` communicates with the composition through React context. Bundling a
 * copy of `remotion` into this library would give a consuming app two module
 * instances — two contexts — and `useCurrentFrame()` inside a template would
 * read from the wrong one and throw. The bug would look like "the SDK is
 * broken" and be nearly impossible to diagnose from the outside.
 *
 * So `react`, `react-dom`, `remotion`, every `@remotion/*` and `zod` are peers,
 * resolved from the consumer's own node_modules.
 *
 * The `@/` alias IS resolved here, at build time. That is the whole reason a
 * build step exists rather than publishing `src/` directly: those specifiers
 * mean nothing in someone else's bundler.
 */
export default defineConfig({
  root: here,
  plugins: [react()],
  resolve: {
    alias: { '@': path.join(here, 'src') },
  },
  build: {
    outDir: path.join(here, 'dist/runtime'),
    emptyOutDir: true,
    // The consumer's bundler minifies its own build; shipping readable output
    // means a stack trace from inside the runtime names a real function.
    minify: false,
    sourcemap: true,
    lib: {
      entry: path.join(here, 'src/runtime/index.js'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'zod',
        'remotion',
        /^@remotion\//,
      ],
    },
  },
});
