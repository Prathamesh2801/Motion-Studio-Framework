# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Remotion 4 + React 19 + Tailwind 4 motion-graphics toolkit. **JSX only, no TypeScript.** `@/` aliases `src/` (declared in `jsconfig.json` and `remotion.config.js` — keep both in sync).

## Commands

```bash
npm run studio          # Remotion Studio (entry src/index.jsx), :3000
npm test                # node scripts/test.mjs — plain node:assert, no runner
npm run compositions    # list composition ids
npm run render -- <CompositionId> out/x.mp4
npm run still -- <CompositionId> out/x.png --frame=60
npm run sprite -- CloudSlash-Square [--size 256] [--fps 30] [--cols N]   # → out/sprites/<id>/{png,json,preview.html}
npm run theme:css       # regenerate src/styles/tailwind.css from src/design/theme/tokens.js
npm run create-project -- my-film --title "My Film"
# transparent render:
npx remotion render src/index.jsx CloudSlash-Square out/icons/CloudSlash.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le
```

No way to run a single test: `scripts/test.mjs` is one file of `test(name, fn)` calls; comment out or filter by editing it.

## Architecture

Dependency points inward: `projects → templates → design → framework`.

- `framework/` — brand-agnostic primitives: animations, presets, camera, transitions, layouts, components, formats (landscape/reel/square/ultrawide/exhibition), `buildTimeline`, `registerProject`. Most extension points are name→impl registries (`helpers/registry.js`).
- `design/` — theme contract, tokens, brands (default/atelier/editorial/broadcast), fonts. JS tokens are the source of truth; `src/styles/tailwind.css` is **generated** — never edit it by hand.
- `templates/` — 12 scene templates + `StandardFilm`. A film = `buildTimeline([...beats])` + a `scenes` map of beat id → scene element.
- `projects/` — one folder per video, each listed explicitly in `projects/registry.js` (explicit array, not a glob: Remotion bundles statically). `Root.jsx` maps over it via `registerProject`, which emits one `<Composition>` per format (id `${id}-${Format}`), wrapped in the theme. Duration comes from the timeline (`(fps) => frames`) or a constant.
- `projects/icon-animations/` — SVG redraws of `raw-assets/*.png`, viewBox = source PNG pixel space. Raster sources and their patched copies (badges/droplets painted out so they can be animated back in: `vials.png`, `disc-clean.png`) live in `public/projects/icon-animations/`.
- `SpriteSheet.jsx` — a `Tools/SpriteSheet` composition driven by `scripts/spritesheet.mjs`: one still where each cell is a `<Freeze>` of a registered project.

## Gotchas

- Framework components call `useCurrentFrame()`; they only render inside Remotion.
- Config must be named `remotion.config.js` — a `.mjs` is silently ignored. Don't set CRF there: ProRes rejects `--crf`.
- All `@remotion/*` packages must share one exact version.
- No global page background (removed from `theme-to-css.mjs`) so renders can be transparent; films paint their own backgrounds.
- Sprite sheets: `<Freeze>` clamps to the composition's length, so the SpriteSheet composition spans all frozen frames. SVG `id`s in animations must be unique per instance (`useId`), or every cell uses the first cell's mask/gradient. Child `useVideoConfig()` there reports the sheet's size, not the source's.
- Remotion's bundled ffmpeg is a stripped build (no `fps`/`tile` filters) — don't plan on it for image processing.
- From scripts, call `node node_modules/@remotion/cli/remotion-cli.js`, not `npx`: on Windows `npx` goes via cmd, which splits arguments on `,` and `=`.
- `out/` is regenerable build output.
