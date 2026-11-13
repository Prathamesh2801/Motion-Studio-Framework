# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Remotion 4 + React 19 + Tailwind 4 motion-graphics codebase. **JSX only, no TypeScript.** `@/` aliases `src/` (declared in `jsconfig.json`, `remotion.config.js` and both Vite configs — keep all of them in sync).

## Commands

```bash
npm run studio          # Remotion Studio (entry src/index.jsx), :3000
npm run editor          # Vite data-driven editor (src/studio), :5173
npm test                # node scripts/test.mjs — plain node:assert, no runner
npm run verify          # tests + theme sync + resolve compositions + 18 stills into out/verify
npm run render -- <CompositionId> out/x.mp4
npm run compositions    # list composition ids
# transparent render (e.g. the icon animations in src/projects/icon-animations):
npx remotion render src/index.jsx CloudSlash-Square out/icons/CloudSlash.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le
npm run theme:css       # regenerate src/styles/tailwind.css from src/design/theme/tokens.js
npm run build:runtime   # package src/runtime as @motion/runtime into dist/runtime
npm run create-project -- my-film --title "My Film"
```

No way to run a single test: `scripts/test.mjs` is one file of `test(name, fn)` calls; comment out or filter by editing it.

## Architecture

Dependency points inward: `runtime → studio/packs → engine → templates → design → framework`.

- `framework/` — brand-agnostic primitives: animations, presets, camera, transitions, layouts, components, formats (landscape/reel/square/ultrawide/exhibition), `buildTimeline`, `registerProject`. Most extension points are name→impl registries (`helpers/registry.js`).
- `design/` — theme contract, tokens, brands (default/atelier/editorial/broadcast), fonts. JS tokens are the source of truth; `src/styles/tailwind.css` is **generated** — never edit it by hand.
- `templates/` — scene templates + `StandardFilm`. A film = `buildTimeline([...beats])` + a `scenes` map of beat id → scene element.
- `projects/` — one-off films, each listed explicitly in `projects/registry.js` (explicit array, not a glob: Remotion bundles statically). `Root.jsx` maps over it via `registerProject`, which emits one `<Composition>` per format, wrapped in the theme. Duration comes from the timeline (`(fps) => frames`), never a literal.
- `engine/` + `packs/` — data-driven "one film, N JSON documents". A pack = `schema.js` (zod), `adapter.js` (domain → ViewModel; the only file allowed domain nouns — `npm test` greps for violations), `timeline.js`, `Film.jsx`, `facets.js`, `data/*.json`, registered in `packs/registry.js`. Both Remotion `<Composition>` and editor `<Player>` mount through `resolvePack` so dims/duration/theme can't drift.
- `studio/` — Vite editor; previews packs live with `@remotion/player`.
- `runtime/` — `@motion/runtime` public SDK (`<PlayerStatsTemplate data={...}/>`). Templates become public via `runtime/templates.js`. Remotion packages are externals in `vite.runtime.config.js`.

## Gotchas

- Framework components call `useCurrentFrame()`; they only render inside Remotion or `@remotion/player`.
- Config must be named `remotion.config.js` — a `.mjs` is silently ignored.
- Vite is pinned to 7 because `@tailwindcss/vite` 4.1.x rejects Vite 8. All `@remotion/*` must share one exact version.
- Consumers of the runtime must install the `npm pack` tarball, not `npm link` (duplicate React → `useMemo` of null). `autoPlay` alone stays frozen on frame 0 until user interaction; pass `controls`.
- `public/projects/lens-threshold/video/**` is gitignored (large footage); `src/projects/lens-threshold/game-data/Royal_Alley` is a git submodule.
- `out/` and `dist/` are regenerable build output.

Further detail lives in `docs/` (`AUTHORING.md`, `PACK_ENGINE.md`, `RUNTIME.md`, `TEMPLATES.md`).
