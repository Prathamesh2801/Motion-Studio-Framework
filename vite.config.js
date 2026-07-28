import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite config for the EDITOR only. Remotion has its own bundler and its own
 * config (`remotion.config.js`); this file never touches a render.
 *
 * ── THE TWO THINGS THAT MUST MATCH remotion.config.js ───────────────────────
 * Two bundlers compile the same source tree, so anything they disagree about
 * breaks imports in exactly one host — the worst kind of build error, because
 * the other host keeps working and hides it.
 *
 *   1. The `@/ -> src/` alias.
 *   2. Tailwind v4, reading the same generated `src/styles/tailwind.css`.
 *      (Remotion gets it via `@remotion/tailwind-v4`; both are pinned to the
 *      same tailwindcss version in package.json, which is why Vite is pinned to
 *      7 — @tailwindcss/vite 4.1.x does not accept Vite 8.)
 *
 * `root` is the REPO root, not `src/studio`, so Vite's `publicDir` is the same
 * `public/` folder Remotion serves. That is what makes `staticFile('packs/...')`
 * resolve to the identical URL in the preview and in the render — no per-host
 * asset branching anywhere in the system.
 */
export default defineConfig({
  root: here,
  publicDir: path.join(here, 'public'),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.join(here, 'src') },
  },
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: path.join(here, 'out/editor'),
    emptyOutDir: true,
  },
});
